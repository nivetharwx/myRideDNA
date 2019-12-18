import React, { Component } from 'react';
import { connect } from 'react-redux';
import { StyleSheet, View, ScrollView, ImageBackground, Image, StatusBar, FlatList, Alert } from 'react-native';
import { APP_COMMON_STYLES, widthPercentageToDP, PageKeys, CUSTOM_FONTS, heightPercentageToDP, POST_TYPE, THUMBNAIL_TAIL_TAG, MEDIUM_TAIL_TAG, GET_PICTURE_BY_ID, PORTRAIT_TAIL_TAG } from '../../../../constants';
import { Actions } from 'react-native-router-flux';
import { IconButton, ShifterButton, LinkButton } from '../../../../components/buttons';
import { appNavMenuVisibilityAction, updateBikePictureAction, setCurrentBikeIdAction, updatePageContentStatusAction, getCurrentBikeAction, updateBikeWishListAction, updateBikeCustomizationsAction, updateBikeLoggedRideAction, getCurrentBikeSpecAction } from '../../../../actions';
import { DefaultText } from '../../../../components/labels';
import { BaseModal } from '../../../../components/modal';
import { ImageLoader } from '../../../../components/loader';
import { SmallCard } from '../../../../components/cards';
import { setBikeAsActive, deleteBike, getPicture, getPosts, getPictureList, getAllRecordedRides, getRecordRides } from '../../../../api';

class BikeDetails extends Component {
    constructor(props) {
        super(props);
        this.state = {
            showOptionsModal: false,
            isLoadingProfPic: false,
        };
    }

    componentDidMount() {
        if (this.props.bike) {
            this.props.getPosts(this.props.user.userId, POST_TYPE.WISH_LIST, this.props.postTypes[POST_TYPE.WISH_LIST].id, this.props.bike.spaceId);
            this.props.getPosts(this.props.user.userId, POST_TYPE.MY_RIDE, this.props.postTypes[POST_TYPE.MY_RIDE].id, this.props.bike.spaceId);
            this.props.getRecordRides(this.props.user.userId, this.props.bike.spaceId)
        }
    }

    componentDidUpdate(prevProps, prevState) {
        if (!this.props.bike) return this.onPressBackButton();
        if (this.props.updatePageContent && (!prevProps.updatePageContent || prevProps.updatePageContent !== this.props.updatePageContent)) {
            this.fetchUpdates(this.props.updatePageContent.type);
        }
        if (prevProps.bike === null && this.props.bike !== null) {
            this.props.getRecordRides(this.props.user.userId, this.props.bike.spaceId)
            this.props.getPosts(this.props.user.userId, POST_TYPE.WISH_LIST, this.props.postTypes[POST_TYPE.WISH_LIST].id, this.props.bike.spaceId);
            this.props.getPosts(this.props.user.userId, POST_TYPE.MY_RIDE, this.props.postTypes[POST_TYPE.MY_RIDE].id, this.props.bike.spaceId);
        }
    }
    // if (this.props.bike.picture) {
    //     if (!prevProps.bike.picture || prevProps.bike.picture.id !== this.props.bike.picture.id) {
    //         this.setState({ isLoadingProfPic: true });
    //         this.props.getBikePicture(this.props.bike.picture.id.replace(THUMBNAIL_TAIL_TAG, MEDIUM_TAIL_TAG), this.props.bike.spaceId);
    //     }
    //     if (this.props.bike.picture.data && this.state.isLoadingProfPic) this.setState({ isLoadingProfPic: false });
    // }
    // if (prevProps.bike.customizations !== this.props.bike.customizations) {
    // const myRidePicIds = this.props.bike.customizations.reduce((obj, item) => {
    //     // TODO: Have to change when API changes the pictureIds key with pictures key
    //     if (item.pictureIds && item.pictureIds[0] && !item.pictureIds[0].data) {
    //         obj[item.id] = item.pictureIds[0].id;
    //     }
    //     return obj;
    // }, {});
    // if (Object.keys(myRidePicIds).length > 0) this.props.getPostsPictures(myRidePicIds, POST_TYPE.MY_RIDE);
    // }

    fetchUpdates(updatedContentType) {
        switch (updatedContentType) {
            case POST_TYPE.WISH_LIST:
                this.props.getPosts(this.props.user.userId, POST_TYPE.WISH_LIST, this.props.postTypes[POST_TYPE.WISH_LIST].id, this.props.bike.spaceId);
                break;
            case POST_TYPE.MY_RIDE:
                this.props.getPosts(this.props.user.userId, POST_TYPE.MY_RIDE, this.props.postTypes[POST_TYPE.MY_RIDE].id, this.props.bike.spaceId);
                break;
        }
    }

    showAppNavMenu = () => this.props.showAppNavMenu();

    openBikeForm = () => {
        this.hideOptionsModal();
        Actions.push(PageKeys.ADD_BIKE_FORM, {});
    }

    openBikeAlbum = () => {
        Actions.push(PageKeys.BIKE_ALBUM);
    }

    makeAsActiveBike = () => {
        this.props.setBikeAsActive(this.props.user.userId, this.props.bike.spaceId, this.props.bike.spaceId);
    }

    onPressBackButton = () => Actions.pop();

    onPressDeleteBike = () => {
        setTimeout(() => {
            Alert.alert(
                'Remove confirmation',
                `Are you sure to remove ${this.props.bike.name} from your list?`,
                [
                    {
                        text: 'Cancel',
                        onPress: () => console.log('Cancel Pressed'),
                        style: 'cancel',
                    },
                    { text: 'Remove', onPress: () => this.props.deleteBike(this.props.user.userId, this.props.bike.spaceId) },
                ]
            );
        }, 100);
        this.hideOptionsModal();
    }

    addStoryFromRoad = () => null; // Actions.push(PageKeys.POST_FORM, { comingFrom: Actions.currentScene, postType: POST_TYPE.STORIES_FROM_ROAD, currentBikeId: this.props.bike.spaceId });

    addWish = () => Actions.push(PageKeys.POST_FORM, { comingFrom: Actions.currentScene, postType: POST_TYPE.WISH_LIST, currentBikeId: this.props.bike.spaceId });

    addMyRide = () => Actions.push(PageKeys.POST_FORM, { comingFrom: Actions.currentScene, postType: POST_TYPE.MY_RIDE, currentBikeId: this.props.bike.spaceId });

    showOptionsModal = () => this.setState({ showOptionsModal: true });

    hideOptionsModal = () => this.setState({ showOptionsModal: false });

    openMyRidePage = () => Actions.push(PageKeys.BIKE_SPEC_LIST, { comingFrom: Actions.currentScene, postType: POST_TYPE.MY_RIDE });

    openWishListPage = () => Actions.push(PageKeys.BIKE_SPEC_LIST, { comingFrom: Actions.currentScene, postType: POST_TYPE.WISH_LIST });

    openLoggedRidePage = () => Actions.push(PageKeys.LOGGED_RIDE, { comingFrom: Actions.currentScene, postType: POST_TYPE.LOGGED_RIDES });

    openBikeSpecPage = (postType, postId) => {
        this.props.getCurrentBikeSpec(postType, postId);
        Actions.push(PageKeys.BIKE_SPEC, { comingFrom: Actions.currentScene, postType, postId });
    }

    postKeyExtractor = item => item.id;

    loggedRideKeyExtractor = item => item.rideId;

    renderSmallCard(postType, id, pictureId, title) {
        return <SmallCard
            image={pictureId ? `${GET_PICTURE_BY_ID}${pictureId}` : null}
            imageStyle={styles.imageStyle}
            customPlaceholder={
                <ImageBackground style={{ width: null, height: null, flex: 1, justifyContent: 'center', alignItems: 'center' }} source={require('../../../../assets/img/textured-black-background.png')}>
                    <DefaultText style={styles.squareCardTitle}>{title}</DefaultText>
                    {
                        postType === POST_TYPE.LOGGED_RIDES ?
                            <DefaultText style={[styles.squareCardTitle, { fontSize: 12, letterSpacing: 2.4 }]}>{this.props.user.distanceUnit === 'km' ? 'KILOMETERS' : 'MILES'}</DefaultText>
                            :
                            null
                    }
                </ImageBackground>
            }
            onPress={() => {
                if (postType === POST_TYPE.MY_RIDE) this.openBikeSpecPage(postType, id);
                else if (postType === POST_TYPE.WISH_LIST) this.openBikeSpecPage(postType, id);
                else if (postType === POST_TYPE.LOGGED_RIDES) console.log("Open Logged Ride Item page for ");
            }}
        />
    }

    componentWillUnmount() {
        this.props.getCurrentBike(null);
    }

    render() {
        const { user, bike } = this.props;
        const { showOptionsModal, isLoadingProfPic } = this.state;
        return (
            <View style={styles.fill}>
                <BaseModal containerStyle={APP_COMMON_STYLES.optionsModal} isVisible={showOptionsModal} onCancel={this.hideOptionsModal} onPressOutside={this.hideOptionsModal}>
                    <View style={APP_COMMON_STYLES.optionsContainer}>
                        <LinkButton style={APP_COMMON_STYLES.optionBtn} title='EDIT BIKE' titleStyle={APP_COMMON_STYLES.optionBtnTxt} onPress={this.openBikeForm} />
                        <LinkButton disabled style={APP_COMMON_STYLES.optionBtn} title='DELETE BIKE' titleStyle={APP_COMMON_STYLES.optionBtnTxt} onPress={this.onPressDeleteBike} />
                        <LinkButton style={APP_COMMON_STYLES.optionBtn} title='CANCEL' titleStyle={APP_COMMON_STYLES.optionBtnTxt} onPress={this.hideOptionsModal} />
                    </View>
                </BaseModal>
                <View style={APP_COMMON_STYLES.statusBar}>
                    <StatusBar translucent backgroundColor={APP_COMMON_STYLES.statusBarColor} barStyle="light-content" />
                </View>
                <View style={styles.header}>
                    <IconButton iconProps={{ name: 'md-arrow-round-back', type: 'Ionicons', style: { fontSize: 27 } }}
                        style={styles.headerIconCont} onPress={this.onPressBackButton} />
                    <View style={styles.headingContainer}>
                        <DefaultText style={styles.heading}>
                            {user.name}
                        </DefaultText>
                        {
                            user.nickname ?
                                <DefaultText style={styles.subheading}>
                                    {user.nickname.toUpperCase()}
                                </DefaultText>
                                : null
                        }
                    </View>
                    <IconButton style={{ padding: 10 }} iconProps={{ name: 'options', type: 'SimpleLineIcons', style: { color: '#fff', fontSize: 20 } }} onPress={this.showOptionsModal} />
                </View>
                {
                    !bike
                        ? null
                        : <ScrollView showsVerticalScrollIndicator={false}>
                            <View style={[styles.bikePic, styles.bikeBtmBorder, bike.isDefault ? styles.activeBorder : null]}>
                                <ImageBackground source={bike.picture ? { uri: `${GET_PICTURE_BY_ID}${bike.picture.id.replace(THUMBNAIL_TAIL_TAG, MEDIUM_TAIL_TAG)}` } : require('../../../../assets/img/bike_placeholder.png')} style={{ height: null, width: null, flex: 1, borderRadius: 0 }}>
                                    {
                                        isLoadingProfPic
                                            ? <ImageLoader show={isLoadingProfPic} />
                                            : null
                                    }
                                </ImageBackground>
                            </View>
                            <ImageBackground source={require('../../../../assets/img/odometer-small.png')} style={{ position: 'absolute', marginTop: styles.bikePic.height - 55.5, alignSelf: 'center', height: 111, width: 118, justifyContent: 'center' }}>
                                <DefaultText style={[styles.miles, { fontSize: 12 }]}>{`Coming\nsoon`}</DefaultText>
                            </ImageBackground>
                            <View style={styles.odometerLblContainer}>
                                <DefaultText style={styles.odometerLbl}>TOTAL</DefaultText>
                                <DefaultText style={styles.odometerLbl}>MILES</DefaultText>
                            </View>
                            <View style={styles.container}>
                                <DefaultText style={styles.title}>{bike.name}</DefaultText>
                                <DefaultText numberOfLines={1} style={styles.subtitle}>{`${bike.make || ''}${bike.model ? ' - ' + bike.model : ''} ${bike.notes || ''}`}</DefaultText>
                                {
                                    bike.isDefault
                                        ? <DefaultText style={styles.activeBikeTxt}>Active Bike</DefaultText>
                                        : <LinkButton style={styles.activeBikeBtn} title='Set as Active Bike' titleStyle={styles.activeBikeBtnTxt} onPress={this.makeAsActiveBike} />
                                }
                                <View style={styles.hDivider} />
                                <View style={styles.section}>
                                    <View style={styles.sectionHeader}>
                                        <LinkButton style={styles.sectionLinkBtn} onPress={bike.customizations ? this.openMyRidePage : () => null}>
                                            <DefaultText style={styles.sectionLinkTxt}>My Ride</DefaultText>
                                            <DefaultText style={[styles.sectionLinkTxt, { color: APP_COMMON_STYLES.infoColor, marginLeft: 8 }]}>[see all]</DefaultText>
                                        </LinkButton>
                                        <IconButton style={styles.addBtnCont} iconProps={{ name: 'md-add', type: 'Ionicons', style: { fontSize: 10, color: '#fff' } }} onPress={this.addMyRide} />
                                    </View>
                                    <View style={styles.greyBorder} />
                                    {
                                        bike.customizations
                                            ? <FlatList
                                                style={styles.list}
                                                numColumns={4}
                                                data={bike.customizations.slice(0, 4)}
                                                keyExtractor={this.postKeyExtractor}
                                                renderItem={({ item }) => this.renderSmallCard(POST_TYPE.MY_RIDE, item.id, item.pictureIds && item.pictureIds[0] ? item.pictureIds[0].id : null, item.name)}
                                            />
                                            : null
                                    }
                                </View>
                                <View style={styles.section}>
                                    <View style={styles.sectionHeader}>
                                        <LinkButton style={styles.sectionLinkBtn} onPress={bike.wishList ? this.openWishListPage : () => null}>
                                            <DefaultText style={styles.sectionLinkTxt}>Wish List</DefaultText>
                                            <DefaultText style={[styles.sectionLinkTxt, { color: APP_COMMON_STYLES.infoColor, marginLeft: 8 }]}>[see all]</DefaultText>
                                        </LinkButton>
                                        <IconButton style={styles.addBtnCont} iconProps={{ name: 'md-add', type: 'Ionicons', style: { fontSize: 10, color: '#fff' } }} onPress={this.addWish} />
                                    </View>
                                    <View style={styles.greyBorder} />
                                    {
                                        bike.wishList
                                            ? <FlatList
                                                style={styles.list}
                                                numColumns={4}
                                                data={bike.wishList.slice(0, 4)}
                                                keyExtractor={this.postKeyExtractor}
                                                renderItem={({ item }) => this.renderSmallCard(POST_TYPE.WISH_LIST, item.id, item.pictureIds && item.pictureIds[0] ? item.pictureIds[0].id : null, item.name)}
                                            />
                                            : null
                                    }
                                </View>
                                <View style={styles.section}>
                                    <View style={styles.sectionHeader}>
                                        <LinkButton style={styles.sectionLinkBtn} onPress={this.openLoggedRidePage}>
                                            <DefaultText style={styles.sectionLinkTxt}>Logged Rides</DefaultText>
                                            <DefaultText style={[styles.sectionLinkTxt, { color: APP_COMMON_STYLES.infoColor, marginLeft: 8 }]}>[see all]</DefaultText>
                                        </LinkButton>
                                    </View>
                                    <View style={styles.greyBorder} />
                                    {
                                        bike.loggedRides
                                            ? <FlatList
                                                style={styles.list}
                                                numColumns={4}
                                                data={bike.loggedRides.slice(0, 4)}
                                                keyExtractor={this.loggedRideKeyExtractor}
                                                renderItem={({ item }) => this.renderSmallCard(POST_TYPE.LOGGED_RIDES, item.rideId, item.picture ? item.picture.id : null, item.totalDistance)}
                                            />
                                            : null
                                    }
                                </View>
                                <View style={styles.section}>
                                    <View style={styles.sectionHeader}>
                                        <LinkButton style={styles.sectionLinkBtn}>
                                            <DefaultText style={styles.sectionLinkTxt}>Stories from the Road</DefaultText>
                                            <DefaultText style={[styles.sectionLinkTxt, { color: APP_COMMON_STYLES.infoColor, marginLeft: 8 }]}>[see all]</DefaultText>
                                        </LinkButton>
                                        <IconButton style={styles.addBtnCont} iconProps={{ name: 'md-add', type: 'Ionicons', style: { fontSize: 10, color: '#fff' } }} onPress={this.addStoryFromRoad} />
                                    </View>
                                    <View style={styles.greyBorder} />
                                    <DefaultText style={{ marginTop: 10, color: 'gray', textAlign: 'center' }}> - NOT CODED YET - </DefaultText>
                                </View>
                            </View>
                            <LinkButton style={styles.fullWidthImgLink} onPress={this.openBikeAlbum}>
                                <ImageBackground source={require('../../../../assets/img/my-photos.png')} style={styles.imgBG}>
                                    <DefaultText style={styles.txtOnImg}>Photos</DefaultText>
                                </ImageBackground>
                            </LinkButton>
                        </ScrollView>
                }
                {/* Shifter: - Brings the app navigation menu */}
                <ShifterButton onPress={this.showAppNavMenu} size={18} alignLeft={this.props.user.handDominance === 'left'} />
            </View>
        );
    }
}

const mapStateToProps = (state) => {
    const { user } = state.UserAuth;
    const { postTypes, hasNetwork, updatePageContent } = state.PageState;
    const { currentBike: bike, activeBikeIndex } = state.GarageInfo;
    // const { bike, currentBikeIndex } = state.GarageInfo.spaceList.slice().reduce((obj, b, idx, arr) => {
    //     if (b.spaceId === currentBikeId) {
    //         obj.bike = b;
    //         obj.currentBikeIndex = idx;
    //         console.log("currentBike without selector: ", obj);
    //         arr.splice(1);
    //     }
    //     return obj;
    // }, {});
    // const { bike, currentBikeIndex } = getCurrentBikeState(state);
    return { user, postTypes, hasNetwork, updatePageContent, bike, activeBikeIndex };
}
const mapDispatchToProps = (dispatch) => {
    return {
        showAppNavMenu: () => dispatch(appNavMenuVisibilityAction(true)),
        setBikeAsActive: (userId, spaceId) => dispatch(setBikeAsActive(userId, spaceId)),
        deleteBike: (userId, bikeId) => dispatch(deleteBike(userId, bikeId)),
        // getBikePicture: (pictureId, spaceId) => getPicture(pictureId, (response) => {
        //     dispatch(updateBikePictureAction({ spaceId, picture: response.picture }))
        // }, (error) => console.log("getPicture error: ", error)),
        getCurrentBike: (bikeId) => dispatch(getCurrentBikeAction(bikeId)),
        getRecordRides: (userId, spaceId, successCallback, errorCallback) => dispatch(getRecordRides(userId, spaceId, 0, (res) => {
            if (typeof successCallback === 'function') successCallback(res);
            dispatch(updateBikeLoggedRideAction({ updates: res, reset: true }))
        }, (err) => {
            if (typeof errorCallback === 'function') errorCallback(err);
        })),
        getPosts: (userId, postType, postTypeId, spaceId) => getPosts(userId, postTypeId, spaceId, 0)
            .then(({ data }) => {
                dispatch(updatePageContentStatusAction(null));
                if (typeof successCallback === 'function') successCallback(data);
                switch (postType) {
                    case POST_TYPE.WISH_LIST:
                        dispatch(updateBikeWishListAction({ updates: data, reset: true }));
                        break;
                    case POST_TYPE.MY_RIDE:
                        dispatch(updateBikeCustomizationsAction({ updates: data, reset: true }));
                        break;
                    case POST_TYPE.STORIES_FROM_ROAD:
                        break;
                }
            }).catch(err => typeof errorCallback === 'function' && errorCallback(err)),
        getCurrentBikeSpec: (postType, postId) => dispatch(getCurrentBikeSpecAction({ postType, postId })),
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(BikeDetails);

const styles = StyleSheet.create({
    fill: {
        flex: 1,
        backgroundColor: '#fff',
    },
    container: {
        flex: 1,
        marginHorizontal: 27,
        marginTop: 20
    },
    header: {
        height: APP_COMMON_STYLES.headerHeight,
        backgroundColor: APP_COMMON_STYLES.headerColor,
        flexDirection: 'row',
        elevation: 30,
        shadowOffset: { width: 0, height: 8 },
        shadowColor: '#000000',
        shadowOpacity: 0.9,
        shadowRadius: 5,
        zIndex: 999,
        paddingLeft: 17,
        paddingRight: 25
    },
    headerIconCont: {
        paddingHorizontal: 0,
        width: widthPercentageToDP(9),
        height: widthPercentageToDP(9),
        borderRadius: widthPercentageToDP(9) / 2,
        backgroundColor: '#fff',
        alignSelf: 'center',
    },
    headingContainer: {
        flex: 1,
        marginLeft: 17,
        justifyContent: 'center',
        alignSelf: 'center'
    },
    heading: {
        fontSize: 20,
        color: 'white',
        backgroundColor: 'transparent',
        fontFamily: CUSTOM_FONTS.gothamBold,
        letterSpacing: 0.2
    },
    subheading: {
        color: '#C4C4C4',
        fontFamily: CUSTOM_FONTS.gothamBold,
        letterSpacing: 1.08
    },
    rightIconPropsStyle: {
        height: widthPercentageToDP(7),
        width: widthPercentageToDP(7),
        backgroundColor: '#F5891F',
        borderRadius: widthPercentageToDP(3.5),
        marginRight: 17,
        alignSelf: 'center'
    },
    imgContainer: {
        width: widthPercentageToDP(100),
        height: 175,
        borderBottomWidth: 4
    },
    bikePic: {
        height: 232,
        width: widthPercentageToDP(100),
    },
    bikeBtmBorder: {
        borderBottomWidth: 4,
        borderBottomColor: APP_COMMON_STYLES.headerColor
    },
    activeBorder: {
        borderBottomColor: APP_COMMON_STYLES.infoColor
    },
    activeIndicator: {
        width: 7,
        height: 7,
        borderRadius: 3.5,
        backgroundColor: APP_COMMON_STYLES.infoColor
    },
    odometerLblContainer: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 5
    },
    odometerLbl: {
        color: '#6E6E6E',
        letterSpacing: 2.2,
        fontFamily: CUSTOM_FONTS.robotoSlabBold,
        marginHorizontal: 72
    },
    title: {
        marginTop: 25,
        fontSize: 19,
        fontFamily: CUSTOM_FONTS.robotoBold
    },
    subtitle: {
        marginTop: 5,
    },
    activeBikeTxt: {
        marginTop: 16,
        color: '#fff',
        letterSpacing: 0.6,
        fontSize: 12,
        backgroundColor: APP_COMMON_STYLES.infoColor,
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderRadius: widthPercentageToDP(3.5),
        alignSelf: 'flex-start',
        overflow: 'hidden'
    },
    activeBikeBtnTxt: {
        color: '#585756',
        letterSpacing: 0.6
    },
    activeBikeBtn: {
        marginTop: 16,
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderRadius: 50,
        borderWidth: 1.2,
        borderColor: APP_COMMON_STYLES.infoColor,
        alignSelf: 'flex-start'
    },
    miles: {
        letterSpacing: 0.3,
        textAlign: 'center',
        color: '#fff',
        fontSize: 22,
        fontFamily: CUSTOM_FONTS.dinCondensedBold
    },
    list: {
        flexGrow: 0,
    },
    sectionLinkBtn: {
        paddingHorizontal: 0,
        flexDirection: 'row'
    },
    sectionLinkTxt: {
        fontFamily: CUSTOM_FONTS.robotoSlabBold,
        fontSize: 12,
        paddingBottom: 7,
        letterSpacing: 1.8
    },
    addBtnCont: {
        height: 14,
        width: 14,
        borderRadius: 7,
        backgroundColor: '#a8a8a8',
        marginRight: 10
    },
    section: {
        marginTop: 20,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    greyBorder: {
        height: 13,
        backgroundColor: '#DCDCDE'
    },
    fullWidthImgLink: {
        flex: 1,
        paddingHorizontal: 0,
        marginTop: 20,
        borderTopWidth: 9,
        borderTopColor: '#f69039',
        elevation: 20,
        height: heightPercentageToDP(30)
    },
    imgBG: {
        flex: 1,
        height: null,
        width: null,
        justifyContent: 'center',
        paddingLeft: 20
    },
    txtOnImg: {
        color: '#fff',
        fontSize: 18,
        letterSpacing: 2.7,
        fontFamily: CUSTOM_FONTS.robotoSlabBold,
    },
    hDivider: {
        backgroundColor: '#B1B1B1',
        height: 1.5,
        marginTop: 8
    },
    imageStyle: {
        marginRight: widthPercentageToDP(1.8),
        height: widthPercentageToDP(100 / 5),
        width: widthPercentageToDP(100 / 5)
    },
    squareCardTitle: {
        fontFamily: CUSTOM_FONTS.dinCondensed,
        color: '#FFFFFF',
        fontSize: 30
    },
    imageStyle: {
        marginRight: widthPercentageToDP(1.8),
        height: widthPercentageToDP(100 / 5),
        width: widthPercentageToDP(100 / 5)
    }
});