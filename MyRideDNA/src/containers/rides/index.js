import React, { Component } from 'react';
import {
    SafeAreaView, Text, View, FlatList, ImageBackground,
    TouchableOpacity, Alert, StatusBar, Platform, StyleSheet,
    AsyncStorage, Image, ActivityIndicator
} from 'react-native';
import { connect } from 'react-redux';

import { Tab, TabHeading, Tabs, ScrollableTab, Icon as NBIcon, ListItem, Left, Toast, Card, CardItem, Thumbnail, Body, Button, Right } from "native-base";
import { PageKeys, WindowDimensions, RIDE_TYPE, APP_COMMON_STYLES, IS_ANDROID, widthPercentageToDP, USER_AUTH_TOKEN, THUMBNAIL_TAIL_TAG, MEDIUM_TAIL_TAG, RIDE_TAIL_TAG } from '../../constants';
import { ShifterButton, LinkButton, ImageButton } from '../../components/buttons';
import { appNavMenuVisibilityAction, screenChangeAction, clearRideAction, updateRidePictureInListAction, updateRideCreatorPictureInListAction, apiLoaderActions, updateRideInListAction, updateRideAction, isRemovedAction } from '../../actions';
import { BasicHeader } from '../../components/headers';
import { getAllBuildRides, getRideByRideId, deleteRide, getAllRecordedRides, copyRide, renameRide, getAllPublicRides, copySharedRide, logoutUser, getPicture, getPictureList, updateRide, getRidePictureList } from '../../api';
import { getFormattedDateFromISO } from '../../util';
import { LabeledInput } from '../../components/inputs';
import { IconLabelPair } from '../../components/labels';
import { BaseModal } from '../../components/modal';
import { Loader } from '../../components/loader';


export class Rides extends Component {
    BUILD_RIDE_OPTIONS = [
        {
            text: 'Copy to new ride', id: 'copy', handler: () => {
                this.setState({ isVisibleOptionsModal: false, isVisibleRenameModal: true });
            }
        },
        {
            text: 'Remove from list', id: 'remove', handler: () => {
                const { rideId, name } = this.props.buildRides[this.state.selectedRide.index];
                this.setState({ isVisibleOptionsModal: false }, () => {
                    this.deleteRideConfirmation(rideId, name, this.state.selectedRide.index, RIDE_TYPE.BUILD_RIDE);
                });
            }
        },
        {
            text: 'Change to ', id: 'changePrivacyMode', handler: () => {
                const { rideId, privacyMode } = this.props.buildRides[this.state.selectedRide.index];
                this.setState({ isVisibleOptionsModal: false }, () => {
                    const updatedRide = { rideId };
                    updatedRide.privacyMode = privacyMode === 'private' ? 'public' : 'private';
                    this.props.updateRideInList(updatedRide, RIDE_TYPE.BUILD_RIDE, updatedRide.rideId === this.props.ride.rideId);
                });
            }
        },
        { text: 'Close', id: 'close', handler: () => this.onCancelOptionsModal() }
    ];
    RECORD_RIDE_OPTIONS = [
        {
            text: 'Rename ride', id: 'rename', handler: () => {
                this.setState({ isVisibleOptionsModal: false, isVisibleRenameModal: true });
            }
        },
        {
            text: 'Remove from list', id: 'remove', handler: () => {
                const { rideId, name } = this.props.recordedRides[this.state.selectedRide.index];
                this.setState({ isVisibleOptionsModal: false }, () => {
                    this.deleteRideConfirmation(rideId, name, this.state.selectedRide.index, RIDE_TYPE.RECORD_RIDE);
                });
            }
        },
        {
            text: 'Change to ', id: 'changePrivacyMode', handler: () => {
                const { rideId, privacyMode } = this.props.recordedRides[this.state.selectedRide.index];
                this.setState({ isVisibleOptionsModal: false }, () => {
                    const updatedRide = { rideId };
                    updatedRide.privacyMode = privacyMode === 'private' ? 'public' : 'private';
                    this.props.updateRideInList(updatedRide, RIDE_TYPE.RECORD_RIDE, updatedRide.rideId === this.props.ride.rideId);
                });
            }
        },
        { text: 'Close', id: 'close', handler: () => this.onCancelOptionsModal() }
    ];
    SHARED_RIDE_OPTIONS = [
        {
            text: 'Copy to new ride', id: 'copy', handler: () => {
                this.setState({ isVisibleOptionsModal: false, isVisibleRenameModal: true });
            }
        },
        { text: 'Close', id: 'close', handler: () => this.onCancelOptionsModal() }
    ];
    callInitiatedObj = {};
    constructor(props) {
        super(props);
        this.state = {
            isRefreshing: false,
            activeTab: 0,
            searchQuery: '',
            headerSearchMode: false,
            newRideName: '',
            isVisibleRenameModal: false,
            isVisibleOptionsModal: false,
            selectedRide: null,
            isLoadingData: false,
            isLoading: false
        };
    }

    showAppNavMenu = () => this.props.showAppNavMenu();

    componentDidMount() {
        const { activeTab } = this.state;
        if (activeTab === 0) {
            this.props.getAllBuildRides(this.props.user.userId, true, 0, (res) => {
            }, (err) => {
            });
        } else if (activeTab === 1) {
            this.props.getAllRecordedRides(this.props.user.userId, true, 0, (res) => {
            }, (err) => {
            });
        } else {
            this.props.getAllPublicRides(this.props.user.userId, true, 0, (res) => {
            }, (err) => {
            });
        }
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.props.ride.rideId && (prevProps.ride.rideId !== this.props.ride.rideId)) {
            this.props.changeScreen({ name: PageKeys.MAP });
        }
        const { activeTab } = this.state;
        if (prevState.activeTab != activeTab) {
            if (activeTab === 0) {
                this.props.getAllBuildRides(this.props.user.userId, true, 0, (res) => {
                }, (err) => {
                });
            } else if (activeTab === 1) {
                this.props.getAllRecordedRides(this.props.user.userId, true, 0, (res) => {
                }, (err) => {
                });
            } else {
                this.props.getAllPublicRides(this.props.user.userId, true, 0, (res) => {
                }, (err) => {
                });
            }
        }

        if (prevProps.buildRides !== this.props.buildRides) {
            if (this.state.selectedRide && this.state.selectedRide.rideType === RIDE_TYPE.SHARED_RIDE) {
                Toast.show({
                    text: 'Ride copied to your created rides',
                    buttonText: 'Okay'
                });
                return;
            }
            this.onCancelRenameForm();
            if (this.props.buildRides.length < prevProps.buildRides.length && this.props.isRemoved) {
                this.showDeleteSuccessMessage();
                return;
            }
            let buildPicIdList = this.props.buildRides.reduce((list, ride) => {
                if (ride.snapshotId && !ride.snapshot) {
                    // list.push(ride.snapshotId.replace(THUMBNAIL_TAIL_TAG, MEDIUM_TAIL_TAG));
                    list.push(ride.snapshotId.replace(THUMBNAIL_TAIL_TAG, RIDE_TAIL_TAG));
                }
                return list;
            }, []);
            if (buildPicIdList.length > 0) {
                this.props.getRidePictureList(buildPicIdList, RIDE_TYPE.BUILD_RIDE);
            }
        } else if (prevProps.recordedRides !== this.props.recordedRides) {
            this.onCancelRenameForm();
            if (this.props.buildRides.length < prevProps.buildRides.length) {
                this.showDeleteSuccessMessage()
            }
            let recordPicIdList = this.props.recordedRides.reduce((list, ride) => {
                if (ride.snapshotId && !ride.snapshot) {
                    // list.push(ride.snapshotId.replace(THUMBNAIL_TAIL_TAG, MEDIUM_TAIL_TAG));
                    list.push(ride.snapshotId.replace(THUMBNAIL_TAIL_TAG, RIDE_TAIL_TAG));
                }
                return list;
            }, []);
            if (recordPicIdList.length > 0) {
                this.props.getRidePictureList(recordPicIdList, RIDE_TYPE.RECORD_RIDE);
            }
        } else if (prevProps.sharedRides !== this.props.sharedRides) {
            this.onCancelRenameForm();
            if (prevState.isRefreshing === true) {
                this.setState({ isRefreshing: false });
            }
            let sharedPicIdObj = this.props.sharedRides.reduce((obj, ride) => {
                if (ride.snapshotId && !ride.snapshot && !this.callInitiatedObj[ride.snapshotId]) {
                    this.callInitiatedObj[ride.snapshotId] = true;
                    // obj.snapshotIdList.push(ride.snapshotId.replace(THUMBNAIL_TAIL_TAG, MEDIUM_TAIL_TAG));
                    obj.snapshotIdList.push(ride.snapshotId.replace(THUMBNAIL_TAIL_TAG, RIDE_TAIL_TAG));
                } else {
                    this.callInitiatedObj[ride.snapshotId] = false;
                }
                if (ride.creatorProfilePictureId && !ride.creatorProfilePicture && !this.callInitiatedObj[ride.creatorProfilePictureId]) {
                    this.callInitiatedObj[ride.creatorProfilePictureId] = true;
                    obj.creatorPicIdList.push(ride.creatorProfilePictureId);
                } else {
                    this.callInitiatedObj[ride.creatorProfilePictureId] = false;
                }
                return obj;
            }, { snapshotIdList: [], creatorPicIdList: [] });
            if (sharedPicIdObj.snapshotIdList.length > 0) {
                this.props.getRidePictureList(sharedPicIdObj.snapshotIdList, RIDE_TYPE.SHARED_RIDE);
            }
            if (sharedPicIdObj.creatorPicIdList.length > 0) {
                this.props.getRideCreatorPictureList(sharedPicIdObj.creatorPicIdList, RIDE_TYPE.SHARED_RIDE);
            }
        }
    }

    onPullRefresh = () => {
        this.setState({ isRefreshing: true });
        this.props.getAllPublicRides(this.props.user.userId, false,0, (res) => {
        }, (err) => {
        });
    }

    showDeleteSuccessMessage() {
        Toast.show({
            text: 'Ride removed successfully',
            buttonText: 'Okay'
        });
        this.props.isRemovedAction(false);
    }

    onChangeTab = ({ from, i }) => {
        this.setState({ activeTab: i, headerSearchMode: false });
    }

    keyExtractor = (item) => item.rideId;

    deleteRideConfirmation(rideId, rideName, index, rideType) {
        setTimeout(() => {
            Alert.alert(
                'Confirmation to delete',
                `Are you sure to delete the ${rideName}?`,
                [
                    {
                        text: 'Yes', onPress: () => {
                            // DOC: Clear ride from map if it is currently loaded on map
                            if (this.props.ride.rideId === rideId) {
                                this.props.clearRideFromMap();
                            }
                            this.props.deleteRide(rideId, index, rideType);
                        }
                    },
                    { text: 'Cancel', onPress: () => { }, style: 'cancel' },
                ],
                { cancelable: false }
            );
        }, 100);
    }

    onPressRide(ride) {
        if (this.props.ride.rideId) {
            this.props.clearRideFromMap();
        }
        let rideType = RIDE_TYPE.BUILD_RIDE;
        if (this.state.activeTab === 1) {
            rideType = RIDE_TYPE.RECORD_RIDE;
        } else if (this.state.activeTab === 2) {
            rideType = RIDE_TYPE.SHARED_RIDE;
        }
        this.props.loadRideOnMap(ride.rideId, { rideType, creatorName: ride.creatorName, creatorNickname: ride.creatorNickname, creatorProfilePictureId: ride.creatorProfilePictureId });
    }

    onSubmitRenameForm = () => {
        if (this.state.newRideName === '' || this.state.newRideName === this.state.selectedRide.rideName) return;
        // DOC: Check for selectedRide type and decide the API call
        const { rideType, index } = this.state.selectedRide;
        switch (rideType) {
            case RIDE_TYPE.BUILD_RIDE:
                this.props.copyRide(this.props.buildRides[index].rideId, this.state.newRideName,
                    RIDE_TYPE.BUILD_RIDE, new Date().toISOString());
                break;
            case RIDE_TYPE.RECORD_RIDE:
                this.props.renameRide({ ...this.props.recordedRides[index], name: this.state.newRideName },
                    rideType, this.props.user.userId, index);
                break;
            case RIDE_TYPE.SHARED_RIDE:
                this.props.copySharedRide(this.props.sharedRides[index].rideId, this.state.newRideName,
                    RIDE_TYPE.BUILD_RIDE, this.props.user.userId, new Date().toISOString());
                this.setState({ isVisibleRenameModal: false })
                break;
        }
    }

    showOptionsModal = (rideType, index) => {
        this.setState({ isVisibleOptionsModal: true, selectedRide: { rideType: rideType, index } });
    }

    renderMenuOptions = () => {
        const { selectedRide } = this.state;
        if (selectedRide === null) return;
        switch (selectedRide.rideType) {
            case RIDE_TYPE.BUILD_RIDE:
                return (
                    this.BUILD_RIDE_OPTIONS.map(option => {
                        if (option.id === 'changePrivacyMode') {
                            return <LinkButton
                                key={option.id}
                                onPress={option.handler}
                                highlightColor={APP_COMMON_STYLES.infoColor}
                                style={APP_COMMON_STYLES.menuOptHighlight}
                                title={this.props.buildRides[selectedRide.index].privacyMode === 'private' ? option.text + 'public' : option.text + 'private'}
                                titleStyle={APP_COMMON_STYLES.menuOptTxt}
                            />
                        }
                        return <LinkButton
                            key={option.id}
                            onPress={option.handler}
                            highlightColor={APP_COMMON_STYLES.infoColor}
                            style={APP_COMMON_STYLES.menuOptHighlight}
                            title={option.text}
                            titleStyle={APP_COMMON_STYLES.menuOptTxt}
                        />
                    })
                )
            case RIDE_TYPE.RECORD_RIDE:
                return (
                    this.RECORD_RIDE_OPTIONS.map(option => {
                        if (option.id === 'changePrivacyMode') {
                            return <LinkButton
                                key={option.id}
                                onPress={option.handler}
                                highlightColor={APP_COMMON_STYLES.infoColor}
                                style={APP_COMMON_STYLES.menuOptHighlight}
                                title={this.props.recordedRides[selectedRide.index].privacyMode === 'private' ? option.text + 'public' : option.text + 'private'}
                                titleStyle={APP_COMMON_STYLES.menuOptTxt}
                            />
                        }
                        return <LinkButton
                            key={option.id}
                            onPress={option.handler}
                            highlightColor={APP_COMMON_STYLES.infoColor}
                            style={APP_COMMON_STYLES.menuOptHighlight}
                            title={option.text}
                            titleStyle={APP_COMMON_STYLES.menuOptTxt}
                        />
                    })
                )
            case RIDE_TYPE.SHARED_RIDE:
                return (
                    this.SHARED_RIDE_OPTIONS.map(option => (
                        <LinkButton
                            key={option.id}
                            onPress={option.handler}
                            highlightColor={APP_COMMON_STYLES.infoColor}
                            style={APP_COMMON_STYLES.menuOptHighlight}
                            title={option.text}
                            titleStyle={APP_COMMON_STYLES.menuOptTxt}
                        />
                    ))
                )
        }
    }

    onCancelRenameForm = () => {
        this.setState({ isVisibleRenameModal: false, newRideName: '', selectedRide: null });
    }

    onCancelOptionsModal = () => {
        this.setState({ isVisibleOptionsModal: false, selectedRide: null });
    }

    onPressLogout = async () => {
        this.props.logoutUser(this.props.user.userId, this.props.userAuthToken, this.props.deviceToken);
    }

    getTimeAsFormattedString(estimatedTime) {
        if (!estimatedTime) {
            return '0 h 0 m';
        }
        let h = Math.floor(estimatedTime / 3600);
        let m = Math.floor(estimatedTime % 3600 / 60);
        let timeText = '';
        if (h > 0) {
            timeText += `${h} h`;
        }
        if (m > 0) {
            timeText += ` ${m} m`;
        }
        return timeText;
    }

    getDistanceAsFormattedString(distance, distanceUnit) {
        if (!distance) {
            return '0 ' + distanceUnit;
        }
        if (distanceUnit === 'km') {
            return (distance / 1000).toFixed(2) + ' km';
        } else {
            return (distance * 0.000621371192).toFixed(2) + ' mi';
        }
    }

    renderRides = ({ item, index }) => {
        return <Card>
            <CardItem bordered>
                <Left>
                    {
                        item.creatorProfilePicture
                            ? <Thumbnail source={{ uri: item.creatorProfilePicture }} />
                            : null
                    }
                    <Body>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                            <View>
                                <Text style={{ fontWeight: 'bold', fontSize: widthPercentageToDP(3.8) }}>{item.name}</Text>
                                <Text note></Text>
                            </View>
                            {
                                this.state.activeTab !== 2
                                    ? <Text style={{ color: item.privacyMode === 'private' ? '#6B7663' : APP_COMMON_STYLES.infoColor }}>{item.privacyMode.toUpperCase()}</Text>
                                    : null
                            }
                        </View>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                            <IconLabelPair iconProps={{ name: 'road-variant', type: 'MaterialCommunityIcons', style: { fontSize: widthPercentageToDP(5) } }} text={this.getDistanceAsFormattedString(item.totalDistance, this.props.user.distanceUnit)}
                                textStyle={{ fontSize: widthPercentageToDP(3.5) }} />
                            <IconLabelPair iconProps={{ name: 'access-time', type: 'MaterialIcons', style: { fontSize: widthPercentageToDP(5) } }} text={this.getTimeAsFormattedString(item.totalTime)}
                                textStyle={{ fontSize: widthPercentageToDP(3.5) }} />
                        </View>
                    </Body>
                </Left>
            </CardItem>
            <CardItem cardBody button onPress={() => this.onPressRide(item)} onLongPress={() => {
                let rideType = RIDE_TYPE.BUILD_RIDE;
                if (this.state.activeTab === 1) {
                    rideType = RIDE_TYPE.RECORD_RIDE;
                } else if (this.state.activeTab === 2) {
                    rideType = RIDE_TYPE.SHARED_RIDE;
                }
                this.showOptionsModal(rideType, index);
            }}>
                {
                    item.snapshot
                        ? <Image resizeMode='stretch' source={{ uri: item.snapshot }} style={{ height: 200, width: null, flex: 1 }} />
                        : <ImageBackground blurRadius={3} resizeMode='cover' source={require('../../assets/img/ride-placeholder-image.png')} style={{ height: 200, width: null, flex: 1 }} />
                }
            </CardItem>
            <CardItem>
                {
                    item.privacyMode === 'public'
                        ? <Left>
                            <Button transparent>
                                <NBIcon active name="thumbs-up" />
                                <Text>{item.totalLikes !== 1 ? item.totalLikes + ' Likes' : '1 Like'}</Text>
                            </Button>
                            <Button transparent>
                                <NBIcon active name="chatbubbles" />
                                <Text>{item.totalComments !== 1 ? item.totalComments + ' Comments' : '1 Comment'}</Text>
                            </Button>
                        </Left>
                        : <Left></Left>
                }
                <Body>
                    {/* <Button transparent>
                        <NBIcon active name="chatbubbles" />
                        <Text>{item.totalComments !== 1 ? item.totalComments + ' Comments' : '1 Comment'}</Text>
                    </Button> */}
                </Body>
                <Right>
                    <Text note>{this.getDateLabel((Date.now() - new Date(item.date).getTime()) / 1000 / 60 / 60)}</Text>
                </Right>
            </CardItem>
        </Card>
    }

    getDateLabel(hourDiff) {
        var days = parseInt(parseInt(hourDiff) / 24);
        if (days >= 365) {
            days = parseInt(days / 365);
            days = days > 1 ? days + ' years ago' : days + ' year ago';
        } else if (days >= 30) {
            days = parseInt(days / 30);
            days = days > 1 ? days + ' months ago' : days + ' month ago';
        } else if (days >= 7) {
            days = parseInt(days / 7);
            days = days > 1 ? days + ' weeks ago' : days + ' week ago';
        } else if (days >= 1) {
            days = days > 1 ? days + ' days ago' : days + ' day ago';
        } else if (hourDiff >= 1) {
            hourDiff = parseInt(hourDiff);
            days = hourDiff > 1 ? hourDiff + ' hours ago' : hourDiff + ' hour ago';
        } else if (hourDiff * 60 >= 1) {
            let mintDiff = parseInt(hourDiff * 60);
            days = mintDiff > 1 ? mintDiff + ' minutes ago' : mintDiff + ' minute ago';
        } else {
            days = 'just now';
        }
        return days;
    }


    loadMoreData = () => {
        if (this.state.isLoadingData && this.state.isLoading === false) {
            this.setState({ isLoading: true, isLoadingData: false });
            if (this.state.activeTab === 0) {
                this.props.getAllBuildRides(this.props.user.userId, false, this.props.pageNumber, (res) => {
                    this.setState({ isLoading: false })
                }, (err) => {
                    this.setState({ isLoading: false })
                });
            }
            else if (this.state.activeTab === 1) {
                this.props.getAllRecordedRides(this.props.user.userId, false, this.props.pageNumber, (res) => {
                    this.setState({ isLoading: false })
                }, (err) => {
                    this.setState({ isLoading: false })
                });
            }
            else if (this.state.activeTab === 2) {
                this.props.getAllPublicRides(this.props.user.userId, false, this.props.pageNumber, (res) => {
                    this.setState({ isLoading: false })
                }, (err) => {
                    this.setState({ isLoading: false })
                });
            }
        }
    }

    renderFooter = () => {
        if (this.state.isLoading) {
            return (
                <View
                    style={{
                        paddingVertical: 20,
                        borderTopWidth: 1,
                        borderColor: "#CED0CE"
                    }}
                >
                    <ActivityIndicator animating size="large" />
                </View>
            );
        }
        return null
    }

    render() {
        const { activeTab, searchQuery, headerSearchMode, isVisibleRenameModal, isVisibleOptionsModal, isRefreshing } = this.state;
        const { buildRides, recordedRides, sharedRides, user, showLoader } = this.props;
        return (
            <View style={{ flex: 1 }}>
                <View style={APP_COMMON_STYLES.statusBar}>
                    <StatusBar translucent backgroundColor={APP_COMMON_STYLES.statusBarColor} barStyle="light-content" />
                </View>
                <View style={{ flex: 1 }}>
                    <BaseModal alignCenter={true} isVisible={isVisibleRenameModal} onCancel={this.onCancelRenameForm} onPressOutside={this.onCancelRenameForm}>
                        <View style={{ backgroundColor: '#fff', width: WindowDimensions.width * 0.6, padding: 20, elevation: 3 }}>
                            <LabeledInput placeholder='Enter new name here' onChange={(val) => this.setState({ newRideName: val })}
                                onSubmit={this.onSubmitRenameForm} />
                            <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
                                <LinkButton title='Submit' onPress={this.onSubmitRenameForm} />
                                <LinkButton title='Cancel' onPress={this.onCancelRenameForm} />
                            </View>
                        </View>
                    </BaseModal>
                    <BaseModal isVisible={isVisibleOptionsModal} onCancel={this.onCancelOptionsModal} onPressOutside={this.onCancelOptionsModal}>
                        <View style={[APP_COMMON_STYLES.menuOptContainer, user.handDominance === 'left' ? APP_COMMON_STYLES.leftDominantCont : null]}>
                            {
                                this.renderMenuOptions()
                            }
                        </View>
                    </BaseModal>
                    <BasicHeader title='Rides' searchIconProps={{ name: 'search', type: 'FontAwesome', onPress: () => this.setState({ headerSearchMode: true }) }} searchbarMode={headerSearchMode}
                        searchValue={searchQuery} onChangeSearchValue={(val) => this.setState({ searchQuery: val })} onCancelSearchMode={() => this.setState({ headerSearchMode: false })}
                        onClearSearchValue={() => this.setState({ searchQuery: '' })} rightIconProps={{ name: 'md-exit', type: 'Ionicons', style: { fontSize: widthPercentageToDP(8), color: '#fff' }, onPress: this.onPressLogout }} />
                    <Tabs onChangeTab={this.onChangeTab} style={{ flex: 1, paddingBottom: IS_ANDROID ? 0 : 20, backgroundColor: '#fff', marginTop: APP_COMMON_STYLES.headerHeight }} renderTabBar={() => <ScrollableTab activeTab={activeTab} backgroundColor='#E3EED3' underlineStyle={{ height: 0 }} />}>
                        <Tab
                            heading={<TabHeading style={{ width: widthPercentageToDP(33.3), backgroundColor: activeTab === 0 ? '#81BB41' : '#E3EED3' }}>
                                <IconLabelPair
                                    containerStyle={styles.tabContentCont}
                                    iconProps={{ name: 'motorbike', type: 'MaterialCommunityIcons', style: { color: activeTab === 0 ? '#fff' : '#6B7663' } }}
                                    text={`Created\nRides`}
                                    textStyle={{ color: activeTab === 0 ? '#fff' : '#6B7663' }}
                                />
                            </TabHeading>}>
                            <View>
                                {
                                    buildRides.length > 0 ?
                                        <FlatList
                                            data={buildRides.filter(ride => ride.name.toUpperCase().indexOf(searchQuery.toUpperCase()) > -1)}
                                            renderItem={this.renderRides}
                                            keyExtractor={this.keyExtractor}
                                            ListFooterComponent={this.renderFooter}
                                            onEndReached={this.loadMoreData}
                                            onEndReachedThreshold={0.1}
                                            onMomentumScrollBegin={() => this.setState({ isLoadingData: true })}

                                        />
                                        : <ImageBackground source={require('../../assets/img/empty-rides-bg.png')} style={{ width: '100%', height: '100%' }} />
                                }
                            </View>
                        </Tab>
                        <Tab
                            heading={<TabHeading style={{ width: widthPercentageToDP(33.3), backgroundColor: activeTab === 1 ? '#81BB41' : '#E3EED3', borderColor: '#fff', borderRightWidth: 2, borderLeftWidth: 2 }}>
                                <IconLabelPair
                                    containerStyle={styles.tabContentCont}
                                    iconProps={{ name: 'menu', type: 'MaterialCommunityIcons', style: { color: activeTab === 1 ? '#fff' : '#6B7663' } }}
                                    text={`Recorded\nRides`}
                                    textStyle={{ color: activeTab === 1 ? '#fff' : '#6B7663' }}
                                />
                            </TabHeading>}>
                            <View>
                                {
                                    recordedRides.length > 0 ?
                                        <FlatList
                                            data={recordedRides.filter(ride => ride.name.toUpperCase().indexOf(searchQuery.toUpperCase()) > -1)}
                                            renderItem={this.renderRides}
                                            keyExtractor={this.keyExtractor}
                                            ListFooterComponent={this.renderFooter}
                                            onEndReached={this.loadMoreData}
                                            onEndReachedThreshold={0.1}
                                            onMomentumScrollBegin={() => this.setState({ isLoadingData: true })}

                                        />
                                        : <ImageBackground source={require('../../assets/img/empty-rides-bg.png')} style={{ width: '100%', height: '100%' }} />
                                }
                            </View>
                        </Tab>
                        <Tab
                            heading={<TabHeading style={{ width: widthPercentageToDP(33.3), backgroundColor: activeTab === 2 ? '#81BB41' : '#E3EED3' }}>
                                <IconLabelPair
                                    containerStyle={styles.tabContentCont}
                                    iconProps={{ name: 'ios-people', type: 'Ionicons', style: { color: activeTab === 2 ? '#fff' : '#6B7663' } }}
                                    text={`Shared\nRides`}
                                    textStyle={{ color: activeTab === 2 ? '#fff' : '#6B7663' }}
                                />
                            </TabHeading>}>
                            <View>
                                {
                                    sharedRides.length > 0 ?
                                        <FlatList
                                            data={sharedRides.filter(ride => ride.name.toUpperCase().indexOf(searchQuery.toUpperCase()) > -1)}
                                            refreshing={isRefreshing}
                                            onRefresh={this.onPullRefresh}
                                            renderItem={this.renderRides}
                                            keyExtractor={this.keyExtractor}
                                            ListFooterComponent={this.renderFooter}
                                            onEndReached={this.loadMoreData}
                                            onEndReachedThreshold={0.1}
                                            onMomentumScrollBegin={() => this.setState({ isLoadingData: true })}
                                        />
                                        : <ImageBackground source={require('../../assets/img/empty-rides-bg.png')} style={{ width: '100%', height: '100%' }} />
                                }
                            </View>
                        </Tab>
                    </Tabs>

                    {/* Shifter: - Brings the app navigation menu */}
                    <ShifterButton onPress={this.showAppNavMenu} alignLeft={this.props.user.handDominance === 'left'} />
                </View>
                <Loader isVisible={showLoader} />
            </View>
        );
    }

    componentWillUnmount() {
        console.log("Rides unmounted");
    }
}

const mapStateToProps = (state) => {
    const { showMenu } = state.TabVisibility;
    const { user, userAuthToken, deviceToken } = state.UserAuth;
    const { buildRides, recordedRides, sharedRides, isRemoved } = state.RideList;
    const { ride } = state.RideInfo.present;
    const { showLoader, pageNumber } = state.PageState;
    return { showMenu, user, userAuthToken, deviceToken, buildRides, recordedRides, sharedRides, ride, showLoader, pageNumber, isRemoved };
}

const mapDispatchToProps = (dispatch) => {
    return {
        showAppNavMenu: () => dispatch(appNavMenuVisibilityAction(true)),
        getAllBuildRides: (userId, toggleLoader, pageNumber, successCallback, errorCallback) => dispatch(getAllBuildRides(userId, toggleLoader, pageNumber, successCallback, errorCallback)),
        getAllRecordedRides: (userId, toggleLoader, pageNumber, successCallback, errorCallback) => dispatch(getAllRecordedRides(userId, toggleLoader, pageNumber, successCallback, errorCallback)),
        getAllPublicRides: (userId, toggleLoader, pageNumber, successCallback, errorCallback) => dispatch(getAllPublicRides(userId, toggleLoader, pageNumber, successCallback, errorCallback)),
        loadRideOnMap: (rideId, rideInfo) => dispatch(getRideByRideId(rideId, rideInfo)),
        updateRideInList: (updates, rideType, updateActiveRide) => {
            dispatch(apiLoaderActions(true));
            updateRide(updates, () => {
                dispatch(apiLoaderActions(false));
                dispatch(updateRideInListAction({ ride: updates, rideType }));
                updateActiveRide === true && dispatch(updateRideAction(updates));
            }, (err) => dispatch(apiLoaderActions(false)))
        },
        deleteRide: (rideId, index, rideType) => dispatch(deleteRide(rideId, index, rideType)),
        copyRide: (rideId, rideName, rideType, date) => dispatch(copyRide(rideId, rideName, rideType, date)),
        copySharedRide: (rideId, rideName, rideType, userId, date) => dispatch(copySharedRide(rideId, rideName, rideType, userId, date)),
        renameRide: (ride, rideType, userId, index) => dispatch(renameRide(ride, rideType, userId, index)),
        changeScreen: (screenKey) => dispatch(screenChangeAction(screenKey)),
        clearRideFromMap: () => dispatch(clearRideAction()),
        getRidePicture: (pictureId, rideId, rideType) => getPicture(pictureId, (response) => {
            console.log("getPicture-ride success: ", response);
            dispatch(updateRidePictureInListAction({ rideId, rideType, ...response }))
        }, (error) => console.log("getPicture-ride error: ", error)),
        // getRidePictureList: (pictureIdList, rideType) => getPictureList(pictureIdList, (response) => {
        //     console.log("getRidePictureList-ride success: ", response);
        //     dispatch(updateRidePictureInListAction({ rideType, pictureObject: response }))
        // }, (error) => console.log("getRidePictureList-ride error: ", error)),
        getRidePictureList: (pictureIdList, rideType) => getRidePictureList(pictureIdList, (response) => {
            console.log("getRidePictureList-ride success: ", response);
            dispatch(updateRidePictureInListAction({ rideType, pictureObject: response }))
        }, (error) => console.log("getRidePictureList-ride error: ", error)),
        getRideCreatorPicture: (pictureId, rideId, rideType) => getPicture(pictureId, (response) => {
            console.log("getPicture-CreatorPicture success: ", response);
            dispatch(updateRideCreatorPictureInListAction({ rideId, rideType, ...response }))
        }, (error) => console.log("getPicture-CreatorPicture error: ", error)),
        getRideCreatorPictureList: (pictureIdList, rideType) => getPictureList(pictureIdList, (response) => {
            console.log("getRideCreatorPictureList success: ", response);
            dispatch(updateRideCreatorPictureInListAction({ rideType, pictureObject: response }))
        }, (error) => console.log("getRideCreatorPictureList error: ", error)),
        logoutUser: (userId, accessToken, deviceToken) => dispatch(logoutUser(userId, accessToken, deviceToken)),
        isRemovedAction: (state) => dispatch(isRemovedAction(false))
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Rides);

const styles = StyleSheet.create({
    tabContentCont: {
        paddingHorizontal: 0
    }
});