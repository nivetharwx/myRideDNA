import React, { Component } from 'react';
import { AsyncStorage } from 'react-native';
import Navigation from './navigation';
import FCM, { NotificationActionType, NotificationType, FCMEvent, RemoteNotificationResult, WillPresentNotificationResult } from "react-native-fcm";
import { IS_ANDROID, DEVICE_TOKEN, PageKeys } from './constants';
import store from './store';
import { screenChangeAction, resetCurrentFriendAction, replaceChatMessagesAction, updateNotificationCountAction, updateMessageCountAction, updateChatListAction } from './actions';
import { Actions } from 'react-native-router-flux';
import { Root } from "native-base";
import { seenMessage } from './api';


// this shall be called regardless of app state: running, background or not running. Won't be called when app is killed by user in iOS
// FCM.on(FCMEvent.Notification, (notif) => {
//     console.log("FCM.on(FCMEvent.Notification): ", notif);
//     // there are two parts of notif. notif.notification contains the notification payload, notif.data contains data payload
//     if (notif.local_notification) {
//         //this is a local notification

//         console.log('what i got from   local notif ', notif)
//     }


//     if (notif.opened_from_tray) {
//         //iOS: app is open/resumed because user clicked banner
//         //Android: app is open/resumed because user clicked banner or tapped app icon
//         console.log("FCM.on(FCMEvent.Notification) opened_from_tray");
//     }

// });

// FCM.on(FCMEvent.RefreshToken, (token) => {
//     console.log(token)
//     // fcm token may not be available on first load, catch it here
//     if (token) {
//         AsyncStorage.setItem(DEVICE_TOKEN, token);
//     }
// });
export default class App extends Component {

    async componentDidMount() {
        //FCM.createNotificationChannel is mandatory for Android targeting >=8. Otherwise you won't see any notification
        FCM.createNotificationChannel({
            id: 'default',
            name: 'Default',
            description: 'used for example',
            priority: 'high'
        })
        FCM.getInitialNotification().then(notif => {
            console.log("InitialNotification received: ", notif);
        });

        try {
            let result = await FCM.requestPermissions({
                badge: false,
                sound: true,
                alert: true
            });
        } catch (e) {
            console.error(e);
        }

        this.notificationListener = FCM.on(FCMEvent.Notification, (notification) => {
            console.log('notification in index: ', notification)
            if (notification.body) {
                if (!notification.local_notification && JSON.parse(notification.body).reference && JSON.parse(notification.body).reference.targetScreen) {
                    if (JSON.parse(notification.body).reference.targetScreen === "CHAT" && JSON.parse(notification.body).senderId !== store.getState().UserAuth.user.userId) {
                        console.log('JSON.parse(notification.body) : ', JSON.parse(notification.body))
                        if (store.getState().PageState.appState === 'background') {
                            this.localNotification(notification)
                        }
                        else {
                            if (Actions.currentScene === "chatList") {
                                store.dispatch(updateMessageCountAction({ id: JSON.parse(notification.body).id }));
                            }
                            else {
                                store.dispatch(seenMessage(JSON.parse(notification.body).id, store.getState().UserAuth.user.userId, JSON.parse(notification.body).isGroup, PageKeys.NOTIFICATIONS));
                                store.dispatch(replaceChatMessagesAction({ comingFrom: PageKeys.NOTIFICATIONS, notificationBody: JSON.parse(notification.body) }));
                            }
                            store.dispatch(updateChatListAction({ comingFrom: 'sendMessgaeApi', newMessage: JSON.parse(notification.body), id: JSON.parse(notification.body).id }));
                        }

                    }
                    else {
                        if (!JSON.parse(notification.body).content) {
                            store.dispatch(updateNotificationCountAction())
                        }

                        this.redirectToTargetScreen(JSON.parse(notification.body));
                    }

                }
                else {

                    if (notification.my_custom_data && notification.my_custom_data.reference && notification.my_custom_data.reference.targetScreen && notification.my_custom_data.reference.targetScreen === 'CHAT') {

                        this.redirectToTargetScreen(notification.my_custom_data)
                    }
                    else {
                        if (Actions.currentScene === "chat") {
                            store.dispatch(replaceChatMessagesAction({ comingFrom: 'fcmDeletForEveryone', notificationBody: JSON.parse(notification.body) }));
                        }
                    }
                    // if (JSON.parse(notification.body).reference && JSON.parse(notification.body).reference.targetScreen) {
                    //     JSON.parse(notification.body).reference.targetScreen && this.redirectToTargetScreen(JSON.parse(notification.body));
                    // }

                }
            }
        });

        FCM.getFCMToken().then(token => {
            console.log("TOKEN (getFCMToken)", token);
            if (token) {
                AsyncStorage.setItem(DEVICE_TOKEN, token);
            }
        });

        if (!IS_ANDROID) {
            FCM.getAPNSToken().then(token => {
                console.log("APNS TOKEN (getFCMToken)", token);
            });
        }

        // topic example
        // FCM.subscribeToTopic('sometopic')
        // FCM.unsubscribeFromTopic('sometopic')
    }

    redirectToTargetScreen(body) {
        if (store.getState().PageState.appState === 'background') {
            if (Object.keys(PageKeys).indexOf(body.reference.targetScreen) === -1) {
                if (body.reference.targetScreen === 'REQUESTS') {
                    store.getState().TabVisibility.currentScreen.name !== PageKeys.FRIENDS
                        ? store.dispatch(screenChangeAction({ name: PageKeys.FRIENDS, params: { comingFrom: PageKeys.NOTIFICATIONS, goTo: body.reference.targetScreen, notificationBody: body } }))
                        : Actions.refresh({ comingFrom: PageKeys.NOTIFICATIONS, goTo: body.reference.targetScreen, notificationBody: body });
                }
                return;
            }
            if (body.reference.targetScreen === "FRIENDS_PROFILE") {
                store.dispatch(resetCurrentFriendAction({ comingFrom: PageKeys.NOTIFICATIONS }))
                store.dispatch(screenChangeAction({ name: PageKeys[body.reference.targetScreen], params: { comingFrom: PageKeys.NOTIFICATIONS, notificationBody: body } }));
            }
            else if (body.reference.targetScreen === "CHAT") {
                console.log(Actions.prevState)
                if (store.getState().TabVisibility.currentScreen.name !== PageKeys.CHAT) {
                    console.log('other than CHAT')
                    if (Actions.prevState.routes[Actions.prevState.routes.length - 1].routeName === "chat" && (Actions.prevState.routes[Actions.prevState.routes.length - 2].routeName === "chatList" || Actions.prevState.routes[Actions.prevState.routes.length - 2].routeName === "friends")) {
                        console.log('other than CHAT if')
                        store.dispatch(replaceChatMessagesAction({ comingFrom: PageKeys.NOTIFICATIONS, notificationBody: body }));
                        Actions.refresh({ comingFrom: PageKeys.NOTIFICATIONS, chatInfo: body });
                    }
                    else {
                        console.log('other than CHAT else')
                        store.dispatch(screenChangeAction({ name: PageKeys[body.reference.targetScreen], params: { comingFrom: PageKeys.NOTIFICATIONS, chatInfo: body } }));
                    }
                }
                else {
                    console.log("currentScreen.name is CHAT");
                    if (Actions.prevState.routes.length === 1 && Actions.prevState.routes[0].routeName === "map") {
                        console.log("currentScreen.name is CHAT if");
                        store.dispatch(screenChangeAction({ name: PageKeys[body.reference.targetScreen], params: { comingFrom: PageKeys.NOTIFICATIONS, chatInfo: body } }));
                    }
                    else {
                        console.log("currentScreen.name is CHAT else");
                        store.dispatch(replaceChatMessagesAction({ comingFrom: PageKeys.NOTIFICATIONS, notificationBody: body }));
                        Actions.refresh({ comingFrom: PageKeys.NOTIFICATIONS, chatInfo: body });
                    }
                }
            }
            else {
                store.dispatch(screenChangeAction({ name: PageKeys[body.reference.targetScreen], params: { comingFrom: PageKeys.NOTIFICATIONS, notificationBody: body } }));
            }
        }
    }

    localNotification(notification) {
        console.log('notification local notification : ', JSON.parse(notification.body));
        var notificationBody = JSON.parse(notification.body)
        if (!notification.local_notification) {
            if (notificationBody.groupName) {
                FCM.presentLocalNotification({
                    channel: 'default',
                    id: new Date().valueOf().toString(),
                    title: notificationBody.groupName,
                    body: notificationBody.content,
                    sound: "bell.mp3",
                    priority: "high",
                    ticker: "My Notification Ticker",
                    auto_cancel: true,
                    icon: "@drawable/myridedna_notif_icon",
                    big_text: notificationBody.content,
                    color: "black",
                    vibrate: 300,
                    wake_screen: true,
                    my_custom_data: notificationBody,
                    lights: true,
                    show_in_foreground: true,
                });
            }
            else {
                FCM.presentLocalNotification({
                    channel: 'default',
                    id: new Date().valueOf().toString(),
                    title: notificationBody.senderName,
                    body: notificationBody.content,
                    sound: "bell.mp3",
                    priority: "high",
                    ticker: "My Notification Ticker",
                    auto_cancel: true,
                    icon: "@drawable/myridedna_notif_icon",
                    big_text: notificationBody.content,
                    color: "black",
                    vibrate: 300,
                    wake_screen: true,
                    my_custom_data: notificationBody,
                    lights: true,
                    show_in_foreground: true,
                });
            }
        }
    }

    componentWillUnmount() {
        this.notificationListener.remove();
    }

    render() {
        return (
            <Root>
                <Navigation />
            </Root>
        )
    }
}

