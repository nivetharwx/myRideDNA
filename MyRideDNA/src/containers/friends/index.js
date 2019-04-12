import React, { Component } from 'react';
import { connect } from 'react-redux';
import { StyleSheet, StatusBar, Animated, ImageBackground, AsyncStorage, TouchableWithoutFeedback, Text, View, FlatList, TouchableOpacity } from 'react-native';
import { BasicHeader } from '../../components/headers';
import { Tabs, Tab, TabHeading, ScrollableTab, ListItem, Left, Body, Right, Icon as NBIcon, Toast } from 'native-base';
import { heightPercentageToDP, widthPercentageToDP, APP_COMMON_STYLES, IS_ANDROID, USER_AUTH_TOKEN, WindowDimensions } from '../../constants';
import styles from './styles';
import AllFriendsTab from './all-friends';
import GroupListTab from './group-list';
import { appNavMenuVisibilityAction } from '../../actions';
import { ShifterButton, IconButton, LinkButton } from '../../components/buttons';
import { IconLabelPair } from '../../components/labels';
import { logoutUser, getAllFriendRequests, getPicture, cancelFriendRequest, approveFriendRequest, rejectFriendRequest, createFriendGroup } from '../../api';
import { BaseModal } from '../../components/modal';
import { LabeledInput } from '../../components/inputs';
import { getFormattedDateFromISO } from '../../util';

const BOTTOM_TAB_HEIGHT = heightPercentageToDP(7);
class Friends extends Component {
    tabsRef = null;
    friendsTabsRef = null;
    viewImage = null;
    oldPosition = {};
    position = new Animated.ValueXY();
    dimensions = new Animated.ValueXY();
    animation = new Animated.Value(0);
    randomData = [{
        name: 'ayush',
        id: 1
    }, { name: 'asdasd', id: 2 }]
    constructor(props) {
        super(props);
        this.state = {
            headerSearchMode: false,
            searchQuery: '',
            activeTab: -1,
            groupTabPressed: false,
            friendsActiveTab: 0,
            isVisibleGroupModal: false,
            newGroupName: '',
        };
    }

    componentDidMount() {
        setTimeout(() => {
            this.tabsRef.props.goToPage(0)
        }, 0);
        this.getAllFriendRequestFunction()
    }


    componentDidUpdate(prevProps, prevState) {
        if (prevProps.personInfo !== this.props.personInfo) {
            if (this.props.personInfo === null) {
                this.closeProfile();
            } else {
                this.openProfile();
            }
        }
    }

    getAllFriendRequestFunction = () => {
        this.props.getAllRequest(this.props.user.userId);
    }

    toggleAppNavigation = () => this.props.showAppNavMenu();

    onChangeTab = ({ from, i }) => {
        this.setState({ activeTab: i, headerSearchMode: false }, () => {
            if (this.state.activeTab === 2) {
                this.getAllFriendRequestFunction()
            }
        });
    }

    onChangeFriendsTab = ({ from, i }) => {
        this.setState({ friendsActiveTab: i });
    }

    openProfile = () => {
        const { pageX, pageY, width, height } = this.props.oldPosition;
        this.position.setValue({ x: pageX, y: pageY });
        this.dimensions.setValue({ x: width, y: height });

        this.setState({ selectedPersonImg: this.props.personInfo.image }, () => {
            this.viewImage.measure((dx, dy, dWidth, dHeight, dPageX, dPageY) => {
                Animated.parallel([
                    Animated.timing(this.position.x, {
                        toValue: (dWidth / 2) - (widthPercentageToDP(100) * 65 / 200),
                        duration: 300
                    }),
                    Animated.timing(this.position.y, {
                        toValue: heightPercentageToDP(100) * 10 / 100,
                        duration: 300
                    }),
                    Animated.timing(this.dimensions.x, {
                        toValue: widthPercentageToDP(100) * 65 / 100,
                        duration: 300
                    }),
                    Animated.timing(this.dimensions.y, {
                        toValue: widthPercentageToDP(100) * 65 / 100,
                        duration: 300
                    }),
                    Animated.timing(this.animation, {
                        toValue: 1,
                        duration: 300
                    }),
                ]).start(() => StatusBar.setBarStyle('light-content'));
            });
        });
    }

    cancelingFriendRequest = (item) => {
        this.props.cancelRequest(this.props.user.userId, item.userId, item.id);
    }

    approvingFriendRequest = (item) => {
        this.props.approvedRequest(this.props.user.userId, item.senderId, new Date().toISOString(), item.id);
    }
    rejectingFriendRequest = (item) => {
        this.props.rejectRequest(this.props.user.userId, item.senderId, item.id);
    }
    closeProfile = () => {
        Animated.parallel([
            Animated.timing(this.position.x, {
                toValue: this.props.oldPosition.pageX,
                duration: 300
            }),
            Animated.timing(this.position.y, {
                toValue: this.props.oldPosition.pageX,
                duration: 300
            }),
            Animated.timing(this.dimensions.x, {
                toValue: this.props.oldPosition.width,
                duration: 300
            }),
            Animated.timing(this.dimensions.y, {
                toValue: this.props.oldPosition.height,
                duration: 300
            }),
            Animated.timing(this.animation, {
                toValue: 0,
                duration: 300
            }),
        ]).start(() => {
            this.setState({ selectedPersonImg: null });
        });
    }

    onPressLogout = async () => {
        const accessToken = await AsyncStorage.getItem(USER_AUTH_TOKEN);
        this.props.logoutUser(this.props.user.userId, accessToken);
    }

    renderFriendRequestList = ({ item, index }) => {
        if (item.requestType === "sentRequest") {
            return (
                <ListItem avatar style={{ marginLeft: 0, paddingLeft: 10, backgroundColor: index % 2 === 0 ? '#fff' : '#F3F2F2' }}>
                    <Left style={{ alignItems: 'center', justifyContent: 'center' }}>
                        <NBIcon active name="person" type='MaterialIcons' style={{ width: widthPercentageToDP(6), color: '#fff' }} />
                    </Left>
                    <Body >
                        <Text>{`${item.name} (${item.nickname})`}</Text>
                        <Text>{getFormattedDateFromISO(item.actionDate, '/')}</Text>
                    </Body>
                    <Right>
                        <IconButton iconProps={{ name: 'close', type: 'MaterialIcons', style: { color: APP_COMMON_STYLES.headerColor } }} onPress={() => this.cancelingFriendRequest(item)} />
                    </Right>
                </ListItem>
            )
        }
        else {
            return (
                <ListItem avatar style={{ marginLeft: 0, paddingLeft: 10, backgroundColor: index % 2 === 0 ? '#fff' : '#F3F2F2' }}>
                    <Left style={{ alignItems: 'center', justifyContent: 'center' }}>
                        <NBIcon active name="person" type='MaterialIcons' style={{ width: widthPercentageToDP(6), color: '#fff' }} />
                    </Left>
                    <Body >
                        <Text>{item.senderName}</Text>
                        <Text>({item.senderNickname})</Text>
                    </Body>
                    <Right style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-around' }}>
                        <IconButton iconProps={{ name: 'user-check', type: 'Feather', style: { color: APP_COMMON_STYLES.headerColor } }} onPress={() => this.approvingFriendRequest(item)} />
                        <IconButton iconProps={{ name: 'user-x', type: 'Feather', style: { color: APP_COMMON_STYLES.headerColor } }} onPress={() => this.rejectingFriendRequest(item)} />
                    </Right>
                </ListItem>
            )
        }
    }
    requestKeyExtractor = (item) => item.id;

    onCancelGroupForm = () => {
        this.setState({ isVisibleGroupModal: false, newGroupName: '' });
    }

    onSubmitGroupForm = () => {
        const { newGroupName } = this.state;
        if (newGroupName.trim().length === 0) {
            Toast.show({
                text: 'Please provide a group name',
                buttonText: 'Okay'
            });
        } else {
            this.isAddingGroup = true;
            this.props.createFriendGroup({
                groupName: newGroupName,
                createdBy: this.props.user.userId,
                createdDate: new Date().toISOString(),
            });
            this.setState({
                isVisibleGroupModal: false
            })
        }
    }

    onPressCreateGroup = () => {
        this.setState({ isVisibleGroupModal: true })
    }
    render() {
        const { headerSearchMode, searchQuery, activeTab, friendsActiveTab } = this.state;
        const activeImageStyle = {
            width: this.dimensions.x,
            height: this.dimensions.y,
            left: this.position.x,
            top: this.position.y
        };
        const animatedContentY = this.animation.interpolate({
            inputRange: [0, 1],
            outputRange: [-150, 0]
        });
        const animatedContentOpacity = this.animation.interpolate({
            inputRange: [0, 0.5, 1],
            outputRange: [0, 1, 1]
        });
        const animatedContentStyle = {
            opacity: animatedContentOpacity,
            transform: [{
                translateY: animatedContentY
            }]
        };
        const animatedCrossOpacity = {
            opacity: this.animation
        };

        return (
            <View style={styles.fill}>
                {
                    this.state.selectedPersonImg
                        ? null
                        : <View style={APP_COMMON_STYLES.statusBar}>
                            <StatusBar translucent backgroundColor={APP_COMMON_STYLES.statusBarColor} barStyle="light-content" />
                        </View>
                }
                <View style={{ flex: 1 }}>
                    {
                        this.state.activeTab === 1
                            ?
                            <BasicHeader title='Friends' searchIconProps={{ name: 'search', type: 'FontAwesome', onPress: () => this.setState({ headerSearchMode: true }) }} searchbarMode={headerSearchMode}
                                searchValue={searchQuery} onChangeSearchValue={(val) => this.setState({ searchQuery: val })} onCancelSearchMode={() => this.setState({ headerSearchMode: false, searchQuery: '' })}
                                onClearSearchValue={() => this.setState({ searchQuery: '' })}
                                leftIconProps={{ reverse: true, name: 'md-add', type: 'Ionicons', onPress: this.onPressCreateGroup }}
                                rightIconProps={{ name: 'md-exit', type: 'Ionicons', style: { fontSize: widthPercentageToDP(8), color: '#fff' }, onPress: this.onPressLogout }} />
                            :
                            <BasicHeader title='Friends' searchIconProps={{ name: 'search', type: 'FontAwesome', onPress: () => this.setState({ headerSearchMode: true }) }} searchbarMode={headerSearchMode}
                                searchValue={searchQuery} onChangeSearchValue={(val) => this.setState({ searchQuery: val })} onCancelSearchMode={() => this.setState({ headerSearchMode: false, searchQuery: '' })}
                                onClearSearchValue={() => this.setState({ searchQuery: '' })}
                                rightIconProps={{ name: 'md-exit', type: 'Ionicons', style: { fontSize: widthPercentageToDP(8), color: '#fff' }, onPress: this.onPressLogout }} />

                    }
                    <BaseModal alignCenter={true} isVisible={this.state.isVisibleGroupModal} onCancel={this.onCancelGroupForm} onPressOutside={this.onCancelGroupForm}>
                        <View style={{ backgroundColor: '#fff', width: WindowDimensions.width * 0.6, padding: 20, elevation: 3 }}>
                            <LabeledInput placeholder='Enter group name here' onChange={(val) => this.setState({ newGroupName: val })}
                                onSubmit={this.onSubmitGroupForm} />
                            <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
                                <LinkButton title='Submit' onPress={this.onSubmitGroupForm} />
                                <LinkButton title='Cancel' onPress={this.onCancelGroupForm} />
                            </View>
                        </View>
                    </BaseModal>

                    <Tabs locked={true} onChangeTab={this.onChangeTab} style={{ flex: 1, backgroundColor: '#fff', marginTop: APP_COMMON_STYLES.headerHeight }} renderTabBar={() => <ScrollableTab ref={elRef => this.tabsRef = elRef} activeTab={activeTab} backgroundColor='#E3EED3' underlineStyle={{ height: 0 }} />}>
                        <Tab
                            heading={<TabHeading style={{ width: widthPercentageToDP(33.33), backgroundColor: activeTab === 0 ? '#81BB41' : '#E3EED3' }}>
                                <IconLabelPair containerStyle={styles.tabContentCont} text={`Friends`} textStyle={{ color: activeTab === 0 ? '#fff' : '#6B7663' }} iconProps={{ name: 'people-outline', type: 'MaterialIcons', style: { color: activeTab === 0 ? '#fff' : '#6B7663' } }} />
                            </TabHeading>}>
                            <AllFriendsTab refreshContent={activeTab === 0} searchQuery={searchQuery} />
                        </Tab>
                        <Tab
                            heading={<TabHeading style={{ width: widthPercentageToDP(33.33), backgroundColor: activeTab === 1 ? '#81BB41' : '#E3EED3', borderColor: '#fff', borderColor: '#fff', borderLeftWidth: 1, borderRightWidth: 1 }}>
                                <IconLabelPair containerStyle={styles.tabContentCont} text={`Groups`} textStyle={{ color: activeTab === 1 ? '#fff' : '#6B7663' }} iconProps={{ name: 'group', type: 'FontAwesome', style: { color: activeTab === 1 ? '#fff' : '#6B7663' } }} />
                            </TabHeading>}>
                            <GroupListTab refreshContent={activeTab === 1} />
                        </Tab>
                        <Tab
                            heading={<TabHeading style={{ width: widthPercentageToDP(33.33), backgroundColor: activeTab === 2 ? '#81BB41' : '#E3EED3', borderColor: '#fff' }}>
                                <IconLabelPair containerStyle={styles.tabContentCont} text={`Requests`} textStyle={{ color: activeTab === 2 ? '#fff' : '#6B7663' }} iconProps={{ name: 'people', type: 'MaterialIcons', style: { color: activeTab === 2 ? '#fff' : '#6B7663' } }} />
                                {
                                    this.props.allFriendRequests.length > 0 ?
                                        <View style={{
                                            position: 'absolute', minWidth: widthPercentageToDP(6), height: widthPercentageToDP(5), borderRadius: widthPercentageToDP(2),
                                            backgroundColor: 'red', top: 1, left: 15, borderWidth: 2.5, borderColor: '#fff', justifyContent: 'center', alignItems: 'center', padding: widthPercentageToDP(0.25)
                                        }}>
                                            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: widthPercentageToDP(3) }}>{this.props.allFriendRequests.length > 99 ? '99+' : this.props.allFriendRequests.length}</Text>
                                        </View>
                                        : null
                                }

                            </TabHeading>}>

                            <View style={{ backgroundColor: '#fff', flex: 1 }}>
                                <FlatList
                                    data={this.props.allFriendRequests}
                                    renderItem={this.renderFriendRequestList}
                                    keyExtractor={this.requestKeyExtractor}
                                />
                            </View>
                        </Tab>
                    </Tabs>
                    {/* <View style={[StyleSheet.absoluteFill, { zIndex: 900 }]} pointerEvents={this.state.selectedPersonImg ? 'auto' : 'none'}>

                    </View> */}

                    {/* Shifter: - Brings the app navigation menu */}
                    <ShifterButton onPress={this.toggleAppNavigation}
                        containerStyles={{ bottom: this.state.selectedPersonImg ? IS_ANDROID ? BOTTOM_TAB_HEIGHT : BOTTOM_TAB_HEIGHT - 8 : 0 }}
                        alignLeft={this.props.user.handDominance === 'left'} />
                </View>
            </View>
        );
    }
}

const mapStateToProps = (state) => {
    const { user } = state.UserAuth;
    const { personInfo, oldPosition } = state.PageOverTab;
    const { allFriendRequests } = state.FriendRequest;
    return { user, personInfo, oldPosition, allFriendRequests };
}
const mapDispatchToProps = (dispatch) => {
    return {
        showAppNavMenu: () => dispatch(appNavMenuVisibilityAction(true)),
        logoutUser: (userId, accessToken) => dispatch(logoutUser(userId, accessToken)),
        getAllRequest: (userId, accessToken) => dispatch(getAllFriendRequests(userId)),
        cancelRequest: (userId, personId, requestId) => dispatch(cancelFriendRequest(userId, personId, requestId)),
        approvedRequest: (userId, personId, actionDate, requestId) => dispatch(approveFriendRequest(userId, personId, actionDate, requestId)),
        rejectRequest: (userId, personId, requestId) => dispatch(rejectFriendRequest(userId, personId, requestId)),
        getPicture: (userId, accessToken) => dispatch(getPicture(userId)),
        createFriendGroup: (newGroupInfo) => dispatch(createFriendGroup(newGroupInfo)),
    };
}
export default connect(mapStateToProps, mapDispatchToProps)(Friends);