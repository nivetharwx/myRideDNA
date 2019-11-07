import React from 'react';
import { connect } from 'react-redux';
import {
    StyleSheet,
    SafeAreaView, Modal, TouchableOpacity, ScrollView, View, Image,
    TouchableWithoutFeedback, Text, ImageBackground, StatusBar, Platform
} from 'react-native';
import { Icon as NBIcon } from 'native-base';
import { AppMenuButton, ImageButton } from '../buttons';
import { Actions } from 'react-native-router-flux';
import { PageKeys, heightPercentageToDP, widthPercentageToDP, IS_ANDROID } from '../../constants';
import { BasicHeader } from '../headers';
import { appNavMenuVisibilityAction } from '../../actions';


export const MenuModal = ({ isVisible, onClose, onPressNavMenu, activeMenu, notificationCount, hideAppNavMenu, alignCloseIconLeft = false }) => {
    return (
        <SafeAreaView>
            <Modal
                animationType="slide"
                transparent={true}
                visible={isVisible}
                onRequestClose={onClose}>
                <View style={{ flex: 1, paddingVertical: 20, backgroundColor: 'rgba(0,0,0,0.7)' }}>
                    <BasicHeader style={[{}, IS_ANDROID ? null : { marginTop: 20 }]} headerHeight={heightPercentageToDP(8.5)}
                        leftIconProps={{ reverse: true, name: 'md-arrow-round-back', type: 'Ionicons', onPress: hideAppNavMenu }} />

                    <View style={{ flex: 1, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-around', marginTop: heightPercentageToDP(3), padding: widthPercentageToDP(8) }}>
                        <ImageButton isRound={true} imageSrc={require('../../assets/img/menu-rides.png')} imgStyles={styles.navIconImage} onPress={() => onPressNavMenu(PageKeys.RIDES)} />
                        <ImageButton isRound={true} imageSrc={require('../../assets/img/menu-map.png')} imgStyles={styles.navIconImage} onPress={() => onPressNavMenu(PageKeys.MAP)} />
                        <ImageButton isRound={true} imageSrc={require('../../assets/img/menu-friends.png')} imgStyles={styles.navIconImage} onPress={() => onPressNavMenu(PageKeys.FRIENDS)} />
                        <ImageButton isRound={true} imageSrc={require('../../assets/img/menu-profile.png')} imgStyles={styles.navIconImage} onPress={() => onPressNavMenu(PageKeys.PROFILE)} />
                        <TouchableOpacity activeOpacity={0.7} onPress={() => onPressNavMenu(PageKeys.NOTIFICATIONS)}>
                            <View style={styles.navIconImage}>
                                <ImageBackground style={{ width: null, height: null, flex: 1 }} source={require('../../assets/img/menu-notifications.png')}>
                                    {
                                        notificationCount > 0
                                            ? <View style={{
                                                position: 'absolute', width: widthPercentageToDP(7), height: widthPercentageToDP(7), borderRadius: widthPercentageToDP(6),
                                                backgroundColor: '#0076B5', top: 11, right: 10, borderWidth: widthPercentageToDP(1), borderColor: '#fff', justifyContent: 'center', alignItems: 'center'
                                            }}>
                                                <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: widthPercentageToDP(3) }}>{notificationCount}</Text>
                                            </View>
                                            : null
                                    }
                                </ImageBackground>
                            </View>
                        </TouchableOpacity>
                        <ImageButton isRound={true} imageSrc={require('../../assets/img/menu-settings.png')} imgStyles={styles.navIconImage} onPress={() => onPressNavMenu(PageKeys.SETTINGS)} />
                        <ImageButton isRound={true} imageSrc={require('../../assets/img/chat-nav-icon.png')} imgStyles={styles.navIconImage} onPress={() => onPressNavMenu(PageKeys.CHAT_LIST)} />
                        <ImageButton isRound={true} imageSrc={require('../../assets/img/menu-offers.png')} imgStyles={styles.navIconImage} onPress={() => onPressNavMenu(PageKeys.OFFERS)} />
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    )
};
const mapStateToProps = (state) => {
    return {};
}
const mapDispatchToProps = (dispatch) => {
    return {
        hideAppNavMenu: () => dispatch(appNavMenuVisibilityAction(false)),
    };
}
export default connect(mapStateToProps, mapDispatchToProps)(MenuModal);

export const BaseModal = (props) => {
    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={props.isVisible}
            onRequestClose={props.onCancel}>
            {
                props.onPressOutside ?
                    <TouchableOpacity style={[styles.fillParent, props.offSpaceBackgroundColor ? { backgroundColor: props.offSpaceBackgroundColor } : styles.modalOffSpaceBgColor]} onPress={props.onPressOutside}>
                        <ScrollView
                            directionalLockEnabled={true}
                            style={styles.fillParent}
                            contentContainerStyle={[styles.fillParent, IS_ANDROID ? null : styles.safePadding, props.alignCenter ? styles.centerContent : null]}
                        >
                            <TouchableWithoutFeedback>
                                {
                                    props.children
                                }
                            </TouchableWithoutFeedback>
                        </ScrollView>
                    </TouchableOpacity>
                    : <View style={[styles.fillParent, styles.modalOffSpaceBgColor]}>
                        <ScrollView
                            directionalLockEnabled={true}
                            style={styles.fillParent}
                            contentContainerStyle={[styles.fillParent, props.alignCenter ? styles.centerContent : null]}
                        >
                            <TouchableWithoutFeedback>
                                {
                                    props.children
                                }
                            </TouchableWithoutFeedback>
                        </ScrollView>
                    </View>
            }
        </Modal>
    );
}

const styles = StyleSheet.create({
    navIconImage: {
        width: widthPercentageToDP(28.5),
        height: widthPercentageToDP(28.5),
        borderRadius: widthPercentageToDP(14.25)
    },
    fillParent: {
        width: '100%',
        height: '100%'
    },
    centerContent: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalOffSpaceBgColor: {
        backgroundColor: 'rgba(0,0,0,0.7)'
    },
    safePadding: {
        paddingTop: heightPercentageToDP(2)
    }
});

{/*                 <TouchableOpacity activeOpacity={0.4}>
                        <Image source={require('../../assets/img/menu-rides.png')} />
                    </TouchableOpacity>
                    <TouchableOpacity activeOpacity={0.4}>
                        <Image source={require('../../assets/img/menu-profile.png')} />
                    </TouchableOpacity>
                    <TouchableOpacity activeOpacity={0.4}>
                        <Image source={require('../../assets/img/menu-map.png')} />
                    </TouchableOpacity>
                    <TouchableOpacity activeOpacity={0.4}>
                        <Image source={require('../../assets/img/menu-friends.png')} />
                    </TouchableOpacity>
                    <TouchableOpacity activeOpacity={0.4}>
                        <Image source={require('../../assets/img/menu-settings.png')} />
                    </TouchableOpacity>
                    <TouchableOpacity activeOpacity={0.4}>
                        <Image source={require('../../assets/img/menu-offers.png')} />
                    </TouchableOpacity> */}

{/*                 <AppMenuButton containerStyle={{ marginBottom: 10 }} iconProps={{ name: 'motorbike', type: 'MaterialCommunityIcons' }}  onPress={() => onPressNavMenu(PageKeys.RIDES)} />
                    <AppMenuButton containerStyle={{ marginBottom: 10 }} iconProps={{ name: 'person', type: 'MaterialIcons' }} onPress={() => onPressNavMenu(PageKeys.PROFILE)} />
                    <AppMenuButton containerStyle={{ marginBottom: 10 }} iconProps={{ name: 'map', type: 'MaterialIcons' }} onPress={() => onPressNavMenu(PageKeys.MAP)} />
                    <AppMenuButton containerStyle={{ marginBottom: 10 }} iconProps={{ name: 'ios-people', type: 'Ionicons' }} onPress={() => onPressNavMenu(PageKeys.FRIENDS)} />
                    <AppMenuButton containerStyle={{ marginBottom: 10 }} iconProps={{ name: 'settings', type: 'MaterialIcons' }} onPress={() => onPressNavMenu(PageKeys.SETTINGS)} />
                    <AppMenuButton containerStyle={{ marginBottom: 10 }} iconProps={{ name: 'card-giftcard', type: 'MaterialIcons' }} onPress={() => onPressNavMenu(PageKeys.OFFERS)} /> */}