import React, { Component } from 'react';
import { View, ScrollView, Text, TouchableOpacity, StyleSheet, TextInput, SafeAreaView, Platform, StatusBar, Alert } from 'react-native';
import { Icon as NBIcon, Item, Toast } from 'native-base';
import { Actions } from 'react-native-router-flux';
import { connect } from 'react-redux';

import { IconicInput, IconicList, LabeledInput } from '../../components/inputs';
import { BasicHeader } from '../../components/headers';

import { LoginStyles } from '../../containers/login/styles';
import { WindowDimensions, APP_COMMON_STYLES, IS_ANDROID, widthPercentageToDP, heightPercentageToDP, CUSTOM_FONTS } from '../../constants';
import { LoginButton, SocialButtons, IconButton, RoundButton, LinkButton } from '../../components/buttons';
import { isValidEmailFormat } from '../../util';
import Spinner from 'react-native-loading-spinner-overlay';
import { validateEmailOnServer, registerUser } from '../../api';
import Md5 from 'react-native-md5';
import { toggleNetworkStatusAction } from '../../actions';
import { Loader } from '../../components/loader';

class Signup extends Component {
    isVerifyingEmail = false;
    fieldRefs = [];
    constructor(props) {
        super(props);
        this.state = {
            user: {},
            hidePasswd: true,
            hideConfPasswd: true,
            confirmPassword: '',
            showLoader: false,
        };
    }

    componentDidUpdate(prevProps) {
        console.log('componentDidUpdate signup')
        if (prevProps.emailStatus !== this.props.emailStatus) {
            this.isVerifyingEmail = false;
        }
        if (prevProps.signupResult !== this.props.signupResult) {
            this.setState({ showLoader: false }, () => {
                if (this.props.signupResult.success) {
                    setTimeout(() => {
                        Alert.alert('Registration success', this.props.signupResult.success);
                    }, 100);
                    this.onPressBackButton();
                } else {
                    setTimeout(() => {
                        Alert.alert('Registration failed', this.props.signupResult.userMessage);
                    }, 100);
                }
            });
        }

        if (prevProps.hasNetwork === true && this.props.hasNetwork === false) {
            Toast.show({ text: 'Network connection lost', position: 'bottom', duration: 0 });
        }
        if (prevProps.hasNetwork === false && this.props.hasNetwork === true) {
            Toast.hide()
        }
    }

    onChangeName = (name) => {
        this.setState(prevState => ({ user: { ...prevState.user, name: name + '' } }));
    }

    onEmailChange = (email) => {
        this.setState(prevState => ({ user: { ...prevState.user, email: email + '' } }));
    }

    onGenderChange = (gender) => {
        this.setState(prevState => ({ user: { ...prevState.user, gender } }));
    }

    showNetworkError() {
        Alert.alert('Network Info', "Please connect to a network to continue", undefined, { cancelable: false });
    }

    validateEmail = () => {
        if (!this.props.hasNetwork) {
            this.showNetworkError();
            return;
        }
        if (isValidEmailFormat(this.state.user.email)) {
            this.isVerifyingEmail = true;
            this.props.validateEmailOnServer(this.state.user.email);
        } else {
            if (this.state.user.email && this.state.user.email.length > 0) {
                Alert.alert('Error', 'Entered email is not in the proper format');
            }
        }
    }

    passwordFormat = () => {
        if (typeof this.state.user.password === 'undefined') return;
        if (this.state.user.password.length < 5) {
            Alert.alert('Error', 'Password should be greater than 5 character');
        } else if (this.state.user.password.search(/\d/) == -1) {
            Alert.alert('Error', 'Password should contain one number');
        }
    }

    onPasswordsChange = (passwd) => {
        this.setState(prevState => ({ user: { ...prevState.user, password: passwd } }));
    }

    onConfrimPasswordChange = (confirmPassword) => {
        this.setState({ confirmPassword });
    }

    validateFields() {
        if (!this.state.user.name) {
            Alert.alert('Field Error', 'Please provide your name');
            return false;
        }
        if (!this.isVerifyingEmail) {
            if (this.props.emailStatus.isExists === true) {
                Alert.alert('Email exists', 'Entered email is already registered with MyRideDNA');
                return false;
            } else if (!this.state.user.email) {
                Alert.alert('Field Error', 'Please provide your email');
                return false;
            }
        } else {
            return false
        }
        if (this.state.user.password !== this.state.confirmPassword) {
            Alert.alert('Field Error', 'Entered passwords are not matching');
            return false;
        }
        return true;
    }

    togglePasswordVisibility = () => {
        this.setState(prevState => ({ hidePasswd: !prevState.hidePasswd }));
    }

    toggleConfirmPasswordVisibility = () => {
        this.setState(prevState => ({ hideConfPasswd: !prevState.hideConfPasswd }));
    }

    onSubmit = () => {
        if (!this.props.hasNetwork) {
            this.showNetworkError();
            return;
        }
        // TODO: All validations
        if (this.validateFields()) {
            this.setState({ showLoader: true });
            this.props.registerUser({ ...this.state.user, password: Md5.hex_md5(this.state.user.password + '') });
        }
    }

    onPressBackButton = () => {
        console.log('action.prop')
        Actions.pop();
    }

    render() {
        const { user, hidePasswd, hideConfPasswd, showLoader, confirmPassword } = this.state;
        return (
            <View style={{ flex: 1 }}>

                <View style={APP_COMMON_STYLES.statusBar}>
                    <StatusBar translucent backgroundColor={APP_COMMON_STYLES.statusBarColor} barStyle="light-content" />
                </View>
                <View style={{ flex: 1, backgroundColor: 'white' }}>
                    {/* <Spinner
                        visible={showLoader}
                        textContent={'Loading...'}
                        textStyle={{ color: '#fff' }}
                    /> */}
                    <Loader isVisible={showLoader} onCancel={() => this.setState({ showLoader: false })} />
                    <BasicHeader title='Signup' leftIconProps={{ reverse: true, name: 'md-arrow-round-back', type: 'Ionicons', onPress: this.onPressBackButton }} searchbarMode={false} />
                    <ScrollView scrollEnabled={false} style={{ backgroundColor: 'white', marginTop: APP_COMMON_STYLES.headerHeight }} contentContainerStyle={{ flex: 1, paddingTop: 30, justifyContent: 'space-between' }}>
                        <Item>
                            <LabeledInput placeholderColor='#a9a9a9' inputStyle={{ flex: 1, borderBottomWidth: 0, fontFamily: CUSTOM_FONTS.robotoSlabBold }} inputRef={elRef => this.fieldRefs[0] = elRef} returnKeyType='next' onChange={this.onChangeName} placeholder='Name' onSubmit={() => this.fieldRefs[1].focus()} hideKeyboardOnSubmit={false} />
                        </Item>
                        <Item>
                            <IconicList
                                textStyle={{ fontFamily: CUSTOM_FONTS.robotoSlabBold }}
                                selectedValue={user.gender}
                                placeholder='Gender'
                                values={[{ label: 'Male', value: 'male' }, { label: 'Female', value: 'female' }]}
                                pickerStyle={{ borderBottomWidth: 0 }}
                                onChange={this.onGenderChange} />
                        </Item>
                        <Item>
                            <LabeledInput placeholderColor='#a9a9a9' inputStyle={{ flex: 1, borderBottomWidth: 0, fontFamily: CUSTOM_FONTS.robotoSlabBold }} onBlur={this.validateEmail} inputRef={elRef => this.fieldRefs[1] = elRef} returnKeyType='next' onChange={this.onEmailChange} placeholder='Email' inputType='emailAddress' onSubmit={() => this.fieldRefs[2].focus()} hideKeyboardOnSubmit={false} />
                        </Item>
                        <Item>
                            <TextInput placeholderColor='#a9a9a9' onBlur={this.passwordFormat} secureTextEntry={hidePasswd} style={{ flex: 1, fontFamily: CUSTOM_FONTS.robotoSlabBold }} value={user.password} ref={elRef => this.fieldRefs[2] = elRef} returnKeyType='next' onChangeText={this.onPasswordsChange} placeholder='New Password' onSubmitEditing={() => this.fieldRefs[3].focus()} blurOnSubmit={false} />
                            <IconButton onPress={this.togglePasswordVisibility} style={{ backgroundColor: '#0083CA', alignItems: 'center', justifyContent: 'center', width: widthPercentageToDP(8), height: widthPercentageToDP(8), borderRadius: widthPercentageToDP(4) }} iconProps={{ name: hidePasswd ? 'eye' : 'eye-off', type: 'MaterialCommunityIcons', style: { fontSize: widthPercentageToDP(6), paddingRight: 0, color: 'white' } }} />
                        </Item>
                        <Item>
                            <TextInput placeholderColor='#a9a9a9' secureTextEntry={hideConfPasswd} style={{ flex: 1, fontFamily: CUSTOM_FONTS.robotoSlabBold }} value={confirmPassword} ref={elRef => this.fieldRefs[3] = elRef} returnKeyType='next' onChangeText={this.onConfrimPasswordChange} placeholder='Confirm Password' onSubmitEditing={() => { }} blurOnSubmit={true} />
                            <IconButton onPress={this.toggleConfirmPasswordVisibility} style={{ backgroundColor: '#0083CA', alignItems: 'center', justifyContent: 'center', width: widthPercentageToDP(8), height: widthPercentageToDP(8), borderRadius: widthPercentageToDP(4) }} iconProps={{ name: hideConfPasswd ? 'eye' : 'eye-off', type: 'MaterialCommunityIcons', style: { fontSize: widthPercentageToDP(6), paddingRight: 0, color: 'white' } }} />
                        </Item>
                        <View style={{ flexDirection: 'row', paddingHorizontal: 20, paddingVertical: 10, justifyContent: 'space-between', alignItems: 'flex-end' }}>
                            <RoundButton title='GO' style={{ height: 100, width: 100, borderRadius: 100 }} titleStyle={{ fontSize: 25, fontFamily: CUSTOM_FONTS.robotoBold }} onPress={this.onSubmit} />
                            <LinkButton style={{ paddingHorizontal: 20 }} title='Privacy policy' titleStyle={{ color: '#0083CA', fontSize: 17 }} />
                        </View>
                        <View style={{ paddingVertical: heightPercentageToDP(5), backgroundColor: '#EB861E', alignItems: 'flex-end', paddingEnd: 10 }}>
                            <View style={{ flexDirection: 'row', width: '50%', justifyContent: 'space-around' }}>
                                <IconButton onPress={() => { }} style={{ paddingHorizontal: 0 }} iconProps={{ name: 'facebook', type: 'MaterialCommunityIcons', style: { backgroundColor: '#fff', color: '#EB861E', fontSize: 60, borderRadius: 5 } }} />
                                <IconButton onPress={() => { }} style={{ paddingHorizontal: 0 }} iconProps={{ name: 'google-', type: 'Entypo', style: { backgroundColor: '#fff', color: '#EB861E', fontSize: 60, borderRadius: 5 } }} />
                            </View>
                        </View>
                    </ScrollView>
                </View>
            </View>
        );
    }
}

const mapStateToProps = (state) => {
    const { emailStatus, signupResult, user } = state.UserAuth;
    const { hasNetwork } = state.PageState;
    return { emailStatus, signupResult, user, hasNetwork };
}

const mapDispatchToProps = (dispatch) => {
    return {
        validateEmailOnServer: (email) => dispatch(validateEmailOnServer(email)),
        registerUser: (user) => dispatch(registerUser(user)),
        toggleNetworkStatus: (status) => dispatch(toggleNetworkStatusAction(status)),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Signup);

const styles = StyleSheet.create({
    formFieldIcon: {
        color: '#999999'
    },
    termsConditionLink: {
        marginLeft: 20,
        marginVertical: 20,
        color: '#EB861E',
        fontSize: 18
    },
    signupButton: {
        backgroundColor: '#EB861E',
        paddingVertical: 6,
        borderRadius: 5,
        marginHorizontal: 20,
        width: WindowDimensions.width - 40,
    },
    socialButton: {
        flexDirection: 'row',
        height: 40,
        alignItems: 'center',
        borderRadius: 5,
        paddingHorizontal: 10
    }
});