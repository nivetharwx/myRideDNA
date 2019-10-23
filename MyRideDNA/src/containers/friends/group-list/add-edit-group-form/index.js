import React, { Component } from 'react';
import { connect } from 'react-redux';
import { StyleSheet, Platform, TouchableWithoutFeedback, StatusBar, FlatList, ScrollView, View, Keyboard, Alert, TextInput, Text, ActivityIndicator, Animated, Easing, ImageBackground } from 'react-native';
import { Actions } from 'react-native-router-flux';
import { DatePicker, Icon as NBIcon, Toast, ListItem, Left, Body, Right, Thumbnail } from 'native-base';
import { BasicHeader } from '../../../../components/headers';
import { IconButton, BasicButton } from '../../../../components/buttons';
import { APP_COMMON_STYLES, heightPercentageToDP, widthPercentageToDP, IS_ANDROID } from '../../../../constants';
import { LabeledInputPlaceholder } from '../../../../components/inputs';
import { createFriendGroup } from '../../../../api';
import { Loader } from '../../../../components/loader';
import ImagePicker from 'react-native-image-crop-picker';

const hasIOSAbove10 = parseInt(Platform.Version) > 10;

class GroupForm extends Component {
    updatingGroupList = false;
    constructor(props) {
        super(props);
        this.state = {
            groupDetail: {
                groupName: ''
            }
        };
    }

    componentDidMount() {
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.friendGroupList !== this.props.friendGroupList) {
            if (this.updatingGroupList === true) {
                Toast.show({ text: 'Added New Group' });
                this.onPressBackButton();
            }
        }
    }


    retryApiFunction = () => {
        this.state.spinValue.setValue(0);
        Animated.timing(this.state.spinValue, {
            toValue: 1,
            duration: 300,
            easing: Easing.linear,
            useNativeDriver: true
        }).start(() => {
            if (this.props.hasNetwork === true) {
                this.props.getPassengerList(this.props.user.userId, 0, 10, (res) => {
                }, (err) => {
                });
            }
        });

    }

    onPressBackButton = () => {
        Actions.pop()
    }

    onPressGalleryIcon = async () => {
        this.setState({ isLoadingProfPic: true });
        try {
            const imageObj = await ImagePicker.openPicker({
                width: 300,
                height: 300,
                cropping: false,
                includeBase64: true,
            });
            Toast.show({ text: 'One image selected' });
            this.setState(prevState => ({ groupDetail: { ...prevState.groupDetail, mimeType: imageObj.mime, groupPicture: imageObj.data } }));
            // this.props.updateProfilePicture(imageObj.data, imageObj.mime, this.props.user.userId);
        } catch (er) {
            this.setState({ isLoadingProfPic: false });
            console.log("Error occurd: ", er);
        }
    }

    onPressCameraIcon = async () => {
        this.setState({ isLoadingProfPic: true });
        try {
            const imageObj = await ImagePicker.openCamera({
                width: 300,
                height: 300,
                includeBase64: true,
                cropping: false, // DOC: Setting this to true (in openCamera) is not working as expected (19-12-2018).
            });
            Toast.show({ text: 'One image selected' });
            this.setState(prevState => ({ groupDetail: { ...prevState.groupDetail, mimeType: imageObj.mime, groupPicture: imageObj.data } }));
            // this.props.updateProfilePicture(imageObj.data, imageObj.mime, this.props.user.userId);
        } catch (er) {
            this.setState({ isLoadingProfPic: false });
            console.log("Error occurd: ", er);
        }

    }

    onChangeGroupName = (val) => {
        this.setState(prevState => ({ groupDetail: { ...prevState.groupDetail, groupName: val } }));
    }



    onSubmit = () => {
        const { groupDetail } = this.state;
        this.updatingGroupList = true;
        this.props.createFriendGroup({
            groupName: groupDetail.groupName,
            createdBy: this.props.user.userId,
            createdDate: new Date().toISOString(),
            groupPicture: groupDetail.groupPicture,
            mimeType: groupDetail.mimeType
        });
    }


    render() {
        const { groupDetail } = this.state;
        return (
            <View style={styles.fill}>
                <View style={APP_COMMON_STYLES.statusBar}>
                    <StatusBar translucent backgroundColor='black' barStyle="light-content" />
                </View>
                <View style={styles.fill}>
                    <BasicHeader
                        title='New Group'
                        leftIconProps={{ reverse: true, name: 'md-arrow-round-back', type: 'Ionicons', onPress: this.onPressBackButton }}
                    />
                    <ScrollView keyboardShouldPersistTaps='always'>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-evenly', marginTop: heightPercentageToDP(18) }}>
                            <View style={{ alignSelf: 'center' }}>
                                <IconButton Button iconProps={{ name: 'camera', type: 'FontAwesome', style: { fontSize: widthPercentageToDP(9), color: '#F5891F' } }}
                                    style={{}} onPress={this.onPressCameraIcon} />
                                <Text style={{ letterSpacing: 2, marginTop: heightPercentageToDP(1), fontWeight: '500', color: '#000', fontSize: heightPercentageToDP(2) }}>{' TAKE \nPHOTO'}</Text>
                            </View>
                            <View style={{ alignSelf: 'center' }}>
                                <IconButton Button iconProps={{ name: 'md-photos', type: 'Ionicons', style: { fontSize: widthPercentageToDP(9), color: '#F5891F' } }}
                                    style={{}} onPress={this.onPressGalleryIcon} />
                                <Text style={{ letterSpacing: 2, marginTop: heightPercentageToDP(1), fontWeight: '500', color: '#000', fontSize: heightPercentageToDP(2) }}>{'UPLOAD \n PHOTO'}</Text>
                            </View>
                        </View>
                        <View style={{ marginLeft: widthPercentageToDP(12), marginTop: heightPercentageToDP(3) }}>
                            <LabeledInputPlaceholder
                                inputValue={groupDetail.groupName} inputStyle={{ paddingBottom: 0 }}
                                outerContainer={{ marginTop: IS_ANDROID ? null : heightPercentageToDP(3) }}
                                onChange={this.onChangeGroupName} label='GROUP NAME' labelStyle={styles.labelStyle}
                                onSubmit={() => this.fieldRefs[1].focus()} hideKeyboardOnSubmit={false} />
                        </View>
                        <BasicButton title='UPDATE' style={styles.submitBtn} titleStyle={{ letterSpacing: 2, fontSize: heightPercentageToDP(3.5) }} onPress={this.onSubmit} />
                    </ScrollView>
                </View>
                <Loader isVisible={this.props.showLoader} />
            </View>
        );
    }
}

const mapStateToProps = (state) => {
    const { user } = state.UserAuth;
    const { showLoader, pageNumber, hasNetwork, lastApi } = state.PageState;
    const { friendGroupList } = state.FriendGroupList;
    return { user, showLoader, pageNumber, hasNetwork, lastApi, friendGroupList };
}
const mapDispatchToProps = (dispatch) => {
    return {
        createFriendGroup: (newGroupInfo) => dispatch(createFriendGroup(newGroupInfo)),

    };
}
export default connect(mapStateToProps, mapDispatchToProps)(GroupForm);

const styles = StyleSheet.create({
    fill: {
        flex: 1,
        backgroundColor: '#fff'
    },
    labelStyle: {
        color: '#000',
        fontSize: 10,
        fontWeight: 'bold',
        letterSpacing: 1.1
    },
    submitBtn: {
        height: heightPercentageToDP(9),
        backgroundColor: '#f69039',
        marginTop: heightPercentageToDP(45)
    },
});