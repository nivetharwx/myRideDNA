import React, { Component } from 'react';
import { View, StatusBar, Text, ScrollView, TouchableOpacity, TextInput, KeyboardAvoidingView, Alert } from 'react-native';
import { connect } from 'react-redux';
import styles from './styles';
import { APP_COMMON_STYLES, IS_ANDROID, widthPercentageToDP, USER_AUTH_TOKEN, heightPercentageToDP } from '../../constants';
import { BasicHeader } from '../../components/headers';
import { SwitchIconButton, ShifterButton, LinkButton, IconButton } from '../../components/buttons';
import { Item, Icon as NBIcon, Accordion, Toast, Input } from 'native-base';
import { appNavMenuVisibilityAction, resetPasswordErrorAction } from '../../actions';
import { LabeledInput, IconicList } from '../../components/inputs';
import { logoutUser, updateUserInfo, updateShareLocationState, updatePassword, updateUserSettings } from '../../api';
import { BaseModal } from '../../components/modal';
import ForgotPassword from '../../containers/forgot-password';
import Md5 from 'react-native-md5';
import { Actions } from 'react-native-router-flux';
import { Loader } from '../../components/loader';


export class Settings extends Component {
    fieldRefs = [];
    constructor(props) {
        super(props);
        this.state = {
            locationEnable: props.user.locationEnable || false,
            currentPasswd: '',
            newPasswd: '',
            confirmPasswd: '',
            hideCurPasswd: true,
            hideNewPasswd: true,
            hideConfPasswd: true,
            showForgotPasswordModal: false,
            expandedItem: null,
            measurementDistanceUnit: props.user.distanceUnit,
            locationRadiusState: props.user.locationRadius,
            handDominanceState: props.user.handDominance,
            timeIntervalInSeconds: props.user.timeIntervalInSeconds,
            showCircle: props.user.showCircle,
            showLoader: false,
            isUpdatedSetting: false
        };
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.props.updatePasswordError && (prevProps.updatePasswordError !== this.props.updatePasswordError)) {
            Toast.show({
                text: this.props.updatePasswordError.userMessage,
                buttonText: 'Okay',
                position: 'bottom',
                onClose: () => this.props.resetUpdatePasswordError()
            });
        }
        if (this.props.updatePasswordSuccess && (prevProps.updatePasswordSuccess !== this.props.updatePasswordSuccess)) {
            Toast.show({
                text: 'Your password has updated successfully. Please do login again',
                buttonText: 'Okay',
                position: 'bottom',
            });
            this.fieldRefs.forEach(field => field.clear());
            this.setState({ currentPasswd: '', newPasswd: '', confirmPasswd: '' });
            this.onPressLogout();
        }
        if (this.state.isUpdatedSetting) {
            console.log('updated setting')
            Toast.show({
                text: 'Setting updated successfully'
            });
            this.setState({ isUpdatedSetting: false })
        }
    }

    onChangeCurrentPasswordField = (val) => this.setState({ currentPasswd: val });

    onChangeNewPasswordField = (val) => this.setState({ newPasswd: val });

    onChangeConfirmPasswordField = (val) => this.setState({ confirmPasswd: val });

    toggleCurPasswdVisibility = () => this.setState(prevState => ({ hideCurPasswd: !prevState.hideCurPasswd }));

    toggleNewPasswdVisibility = () => this.setState(prevState => ({ hideNewPasswd: !prevState.hideNewPasswd }));

    toggleConfPasswdVisibility = () => this.setState(prevState => ({ hideConfPasswd: !prevState.hideConfPasswd }));

    onFocusNewPasswordField = () => {
        if (this.state.currentPasswd.trim().length === 0) {
            Toast.show({
                text: 'Please provide your current password',
                buttonText: 'Okay',
                position: 'top',
                onClose: () => {
                    this.fieldRefs[0].focus();
                }
            });
        }
    }

    onChangedistanceUnit = (val) => {
        this.setState({
            measurementDistanceUnit: val
        })
    }

    onChangeLoactionradius = (val) => {
        this.setState({
            locationRadiusState: val
        })
    }

    onChangeTimeInterval = (val) => {
        this.setState({
            timeIntervalInSeconds: val
        })
    }

    onChangeHandDominance = (val) => {
        this.setState({
            handDominanceState: val
        })
    }
    onFocusConfirmPasswordField = () => {
        if (this.state.currentPasswd.trim().length === 0) {
            Toast.show({
                text: 'Please provide your current password',
                buttonText: 'Okay',
                position: 'top',
                onClose: () => {
                    this.fieldRefs[0].focus();
                }
            });
        } else if (this.state.newPasswd.trim().length === 0) {
            Toast.show({
                text: 'Please provide proper password',
                buttonText: 'Okay',
                position: 'top',
                onClose: () => {
                    this.fieldRefs[1].focus();
                }
            });
        }
    }

    passwordFormat = () => {
        if (this.state.newPasswd.length < 5) {
            Alert.alert('Error', 'Password should be greater than 5 character');
        } else if (this.state.newPasswd.search(/\d/) == -1) {
            Alert.alert('Error', 'Password should contain one number');
        }
    }

    showAppNavMenu = () => this.props.showAppNavMenu();

    onPressLogout = async () => {
        this.props.logoutUser(this.props.user.userId, this.props.userAuthToken, this.props.deviceToken);
    }

    toggleForgotPasswordForm = () => {
        this.setState(prevState => ({ showForgotPasswordModal: !prevState.showForgotPasswordModal }));
    }

    renderAccordionItem = (item) => {
        if (item.title === 'Change password') {
            const { currentPasswd, newPasswd, confirmPasswd,
                hideCurPasswd, hideNewPasswd, hideConfPasswd } = this.state;
            return (
                <View style={styles.changePasswdFrom}>

                    <Item style={styles.passwdFormField}>
                        <TextInput secureTextEntry={hideCurPasswd} style={styles.fill} value={currentPasswd} ref={elRef => this.fieldRefs[0] = elRef} returnKeyType='next' onChangeText={this.onChangeCurrentPasswordField} placeholder='Current Password' onSubmitEditing={() => this.fieldRefs[1].focus()} blurOnSubmit={false} />
                        <IconButton onPress={this.toggleCurPasswdVisibility} style={{ backgroundColor: '#0083CA', alignItems: 'center', justifyContent: 'center', width: widthPercentageToDP(8), height: widthPercentageToDP(8), borderRadius: widthPercentageToDP(4) }} iconProps={{ name: hideCurPasswd ? 'eye' : 'eye-off', type: 'MaterialCommunityIcons', style: { fontSize: widthPercentageToDP(6), paddingRight: 0, color: 'white' } }} />
                    </Item>
                    <Item style={styles.passwdFormField}>
                        <TextInput onBlur={this.passwordFormat} secureTextEntry={hideNewPasswd} style={styles.fill} value={newPasswd} ref={elRef => this.fieldRefs[1] = elRef} onFocus={this.onFocusNewPasswordField} returnKeyType='next' onChangeText={this.onChangeNewPasswordField} placeholder='New Password' onSubmitEditing={() => this.fieldRefs[2].focus()} blurOnSubmit={false} />
                        <IconButton onPress={this.toggleNewPasswdVisibility} style={{ backgroundColor: '#0083CA', alignItems: 'center', justifyContent: 'center', width: widthPercentageToDP(8), height: widthPercentageToDP(8), borderRadius: widthPercentageToDP(4) }} iconProps={{ name: hideNewPasswd ? 'eye' : 'eye-off', type: 'MaterialCommunityIcons', style: { fontSize: widthPercentageToDP(6), paddingRight: 0, color: 'white' } }} />
                    </Item>
                    <Item style={styles.passwdFormField}>
                        <TextInput secureTextEntry={hideConfPasswd} style={styles.fill} value={confirmPasswd} ref={elRef => this.fieldRefs[2] = elRef} onFocus={this.onFocusConfirmPasswordField} returnKeyType='next' onChangeText={this.onChangeConfirmPasswordField} placeholder='Confirm Password' onSubmitEditing={() => { }} blurOnSubmit={true} />
                        <IconButton onPress={this.toggleConfPasswdVisibility} style={{ backgroundColor: '#0083CA', alignItems: 'center', justifyContent: 'center', width: widthPercentageToDP(8), height: widthPercentageToDP(8), borderRadius: widthPercentageToDP(4) }} iconProps={{ name: hideConfPasswd ? 'eye' : 'eye-off', type: 'MaterialCommunityIcons', style: { fontSize: widthPercentageToDP(6), paddingRight: 0, color: 'white' } }} />
                    </Item>
                    <LinkButton style={styles.linkItem} title='Forgot Password ?' titleStyle={styles.infoLink} onPress={this.toggleForgotPasswordForm} />
                </View>
            );
        }
    }

    hasSettingsChanged = () => {
        const { currentPasswd, newPasswd, confirmPasswd, locationEnable, measurementDistanceUnit,
            locationRadiusState, handDominanceState, timeIntervalInSeconds, showCircle } = this.state;
        return (currentPasswd !== '' && newPasswd !== '' && confirmPasswd !== '') || locationEnable !== this.props.user.locationEnable ||
            (locationRadiusState !== this.props.user.locationRadius) || (measurementDistanceUnit !== this.props.user.distanceUnit) ||
            (handDominanceState !== this.props.user.handDominance) || (timeIntervalInSeconds !== this.props.user.timeIntervalInSeconds) ||
            (showCircle !== this.props.user.showCircle);
    }

    submitSettingsChanges = () => {
        const { currentPasswd, newPasswd, confirmPasswd, locationEnable, measurementDistanceUnit,
            locationRadiusState, handDominanceState, timeIntervalInSeconds, showCircle } = this.state;
        if (currentPasswd !== '' && newPasswd !== '' && confirmPasswd !== '') {
            if (newPasswd === confirmPasswd) {
                this.props.updatePassword({ userId: this.props.user.userId, currentPassword: Md5.hex_md5(currentPasswd + ''), newPassword: Md5.hex_md5(newPasswd + '') });
            } else {
                Toast.show({
                    text: 'Entered passwords are not matching',
                    buttonText: 'Okay',
                    position: 'bottom'
                });
            }
        }
        // TODO: Add new keys here and validate
        if (locationRadiusState !== '' && !isNaN(locationRadiusState) && parseInt(locationRadiusState) > 0
            && !isNaN(timeIntervalInSeconds) && parseInt(timeIntervalInSeconds) > 0) {
            this.props.updateUserSettings({
                userId: this.props.user.userId, distanceUnit: measurementDistanceUnit,
                locationRadius: parseInt(locationRadiusState), handDominance: handDominanceState,
                timeIntervalInSeconds, showCircle, locationEnable
            })
            this.setState({ isUpdatedSetting: true })
        } else {
            Toast.show({
                text: 'fill all field correctly',
                buttonText: 'Okay',
                position: 'bottom'
            });
        }
    }

    render() {
        const MEASUREMENT_UNITS = [{ label: 'Kilometers', value: 'km' }, { label: 'Miles', value: 'mi' }];
        const HAND_DOMINANCE = [{ label: 'Left Handed', value: 'left' }, { label: 'Right Handed', value: 'right' }];
        const { user, showLoader } = this.props;
        const { locationEnable } = this.state;
        return (
            <View style={styles.fill}>
                <ForgotPassword isVisible={this.state.showForgotPasswordModal} onCancel={this.toggleForgotPasswordForm} onPressOutside={this.toggleForgotPasswordForm} />
                <View style={APP_COMMON_STYLES.statusBar}>
                    <StatusBar translucent backgroundColor={APP_COMMON_STYLES.statusBarColor} barStyle="light-content" />
                </View>
                <View style={styles.fill}>
                    <BasicHeader title='Settings' rightIconProps={{ name: 'md-exit', type: 'Ionicons', style: { fontSize: widthPercentageToDP(8), color: '#fff' }, onPress: this.onPressLogout }} />
                    <View style={styles.pageContent}>

                        <ScrollView style={[styles.containerItem, { marginLeft: 0 }]} contentContainerStyle={{ backgroundColor: '#fff' }}>
                            <KeyboardAvoidingView
                                style={{ flex: 1 }}
                                behavior="position"
                            >
                                <Item style={styles.containerItem}>
                                    <Text>Share my location with friends</Text>
                                    <View style={{ flex: 1 }}>
                                        <SwitchIconButton
                                            activeIcon={<NBIcon name='close' type='FontAwesome' style={{ color: '#fff', alignSelf: 'flex-start', paddingHorizontal: 10 }} />}
                                            inactiveIcon={<NBIcon name='eye' type='MaterialCommunityIcons' style={{ color: '#fff', alignSelf: 'flex-end', paddingHorizontal: 12 }} />}
                                            value={!locationEnable} onChangeValue={() => this.setState(prevState => ({ locationEnable: !prevState.locationEnable }))} />
                                    </View>
                                </Item>
                                <Item style={styles.containerItem}>
                                    <LabeledInput containerStyle={{ marginBottom: 0 }} inputStyle={{ borderBottomWidth: 0 }} inputValue={!this.state.timeIntervalInSeconds ? '' : this.state.timeIntervalInSeconds + ''}
                                        placeholder='Time interval in seconds' onChange={this.onChangeTimeInterval} inputType='telephoneNumber'
                                    />
                                </Item>
                                <IconicList
                                    selectedValue={this.state.measurementDistanceUnit} style={styles.distanceMeasurementUnit}
                                    placeholder='Distance measurement unit' values={MEASUREMENT_UNITS} containerStyle={{ paddingLeft: 10 }}
                                    onChange={this.onChangedistanceUnit}
                                />
                                <Item style={styles.containerItem}>
                                    <LabeledInput containerStyle={{ marginBottom: 0 }} inputStyle={{ borderBottomWidth: 0 }} inputValue={!this.state.locationRadiusState ? '' : this.state.locationRadiusState + ''}
                                        placeholder='Location Radius' onChange={this.onChangeLoactionradius} inputType='telephoneNumber'
                                    />
                                </Item>
                                <Item style={styles.containerItem}>
                                    <Text>Show visible map boundary circle</Text>
                                    <View style={{ flex: 1 }}>
                                        <SwitchIconButton
                                            activeIcon={<NBIcon name='close' type='FontAwesome' style={{ color: '#fff', alignSelf: 'flex-start', paddingHorizontal: 10 }} />}
                                            inactiveIcon={<NBIcon name='eye' type='MaterialCommunityIcons' style={{ color: '#fff', alignSelf: 'flex-end', paddingHorizontal: 12 }} />}
                                            value={!this.state.showCircle} onChangeValue={() => this.setState(prevState => ({ showCircle: !prevState.showCircle }))} />
                                    </View>
                                </Item>
                                <IconicList
                                    selectedValue={this.state.handDominanceState}
                                    placeholder='User hand dominance' values={HAND_DOMINANCE} containerStyle={{ paddingLeft: 10 }}
                                    onChange={this.onChangeHandDominance}
                                />

                                <Accordion expanded={this.state.expandedItem} style={{ borderWidth: 0, marginLeft: '1.3%' }} dataArray={[{ title: 'Change password' }]} renderContent={this.renderAccordionItem} headerStyle={{}} />
                            </KeyboardAvoidingView>
                        </ScrollView>

                    </View>
                </View>
                <View style={styles.submitSec}>
                    {
                        this.hasSettingsChanged()
                            ? <TouchableOpacity style={styles.submitButton} onPress={this.submitSettingsChanges}>
                                <NBIcon name='md-checkmark' type='Ionicons' style={styles.submitBtnIcon} />
                            </TouchableOpacity>
                            : <View style={[styles.submitButton, styles.disabled]}>
                                <NBIcon name='md-checkmark' type='Ionicons' style={[styles.submitBtnIcon, styles.disabled]} />
                            </View>
                    }
                </View>


                {/* Shifter: - Brings the app navigation menu */}
                <ShifterButton onPress={this.showAppNavMenu} containerStyles={this.props.hasNetwork === false ? { bottom: heightPercentageToDP(8.5) } : null} alignLeft={user.handDominance === 'left'} />
                <Loader isVisible={showLoader} />
            </View>
        );
    }
}

const mapStateToProps = (state) => {
    const { user, userAuthToken, deviceToken, updatePasswordError, updatePasswordSuccess } = state.UserAuth;
    const { showLoader, hasNetwork } = state.PageState;
    return { user, userAuthToken, deviceToken, updatePasswordError, updatePasswordSuccess, showLoader, hasNetwork };
}

const mapDispatchToProps = (dispatch) => {
    return {
        showAppNavMenu: () => dispatch(appNavMenuVisibilityAction(true)),
        updateUserSettings: (userSettings) => dispatch(updateUserSettings(userSettings)),
        updatePassword: (passwordInfo) => dispatch(updatePassword(passwordInfo)),
        updateShareLocationState: (userId, shareLocState) => dispatch(updateShareLocationState(userId, shareLocState)),
        logoutUser: (userId, accessToken, deviceToken) => dispatch(logoutUser(userId, accessToken, deviceToken)),
        resetUpdatePasswordError: () => dispatch(resetPasswordErrorAction()),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Settings);