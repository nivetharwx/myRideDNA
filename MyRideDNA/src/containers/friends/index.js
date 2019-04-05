import React, { Component } from 'react';
import { connect } from 'react-redux';
import { StyleSheet, StatusBar, Animated, ImageBackground, AsyncStorage, TouchableWithoutFeedback, Text, View, FlatList, TouchableOpacity } from 'react-native';
import { BasicHeader } from '../../components/headers';
import { Tabs, Tab, TabHeading, ScrollableTab, ListItem, Left, Body, Right, Icon as NBIcon } from 'native-base';
import { heightPercentageToDP, widthPercentageToDP, APP_COMMON_STYLES, IS_ANDROID, USER_AUTH_TOKEN } from '../../constants';
import styles from './styles';
import AllFriendsTab from './all-friends';
import GroupListTab from './group-list';
import { appNavMenuVisibilityAction } from '../../actions';
import { ShifterButton, IconButton } from '../../components/buttons';
import { IconLabelPair } from '../../components/labels';
import { logoutUser, getAllFriendRequests, getPicture, cancelFriendRequest, approveFriendRequest, rejectFriendRequest } from '../../api';

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
            friendsActiveTab: 0
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
                console.log("updated to null: ", this.props);
                this.closeProfile();
            } else {
                console.log("update with user: ", this.props);
                this.openProfile();
            }
        }
    }

    getAllFriendRequestFunction = () => {
        this.props.getAllRequest(this.props.user.userId);
    }

    toggleAppNavigation = () => this.props.showAppNavMenu();

    onChangeTab = ({ from, i }) => {
        this.setState({ activeTab: i, headerSearchMode: false });
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
        this.props.cancelRequest(this.props.user.userId, item.userId,item.id);
    }

    approvingFriendRequest = (item) => {
        this.props.approvedRequest(this.props.user.userId, item.senderId, new Date().toISOString(),item.id);
    }
    rejectingFriendRequest = (item) => {
        this.props.rejectRequest(this.props.user.userId, item.senderId,item.id);
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
                    <Left style={{ alignItems: 'center', justifyContent: 'center'}}>
                        <NBIcon active name="person" type='MaterialIcons' style={{ width: widthPercentageToDP(6), color: '#fff' }} />
                    </Left>
                    <Body >
                        <Text>{item.name}</Text>
                        <Text>({item.nickname})</Text>
                    </Body>
                    <Right>
                        <IconButton iconProps={{ name: 'close', type: 'MaterialIcons', style: { color: APP_COMMON_STYLES.headerColor } }} onPress={()=>this.cancelingFriendRequest(item)} />
                    </Right>
                </ListItem>
            )
        }
        else {
            return (
                <ListItem avatar style={{ marginLeft: 0, paddingLeft: 10, backgroundColor: index % 2 === 0 ? '#fff' : '#F3F2F2' }}>
                    <Left style={{ alignItems: 'center', justifyContent: 'center'}}>
                        <NBIcon active name="person" type='MaterialIcons' style={{ width: widthPercentageToDP(6), color: '#fff' }} />
                    </Left>
                    <Body >
                        <Text>{item.senderName}</Text>
                        <Text>({item.senderNickname})</Text>
                    </Body>
                    <Right style={{flex:1, flexDirection: 'row',justifyContent:'space-around'}}>
                        <IconButton  iconProps={{ name: 'user-check', type: 'Feather', style: { color: APP_COMMON_STYLES.headerColor } }} onPress={()=>this.approvingFriendRequest(item)} />
                        <IconButton  iconProps={{ name: 'user-x', type: 'Feather', style: { color: APP_COMMON_STYLES.headerColor } }} onPress={()=>this.rejectingFriendRequest(item)} />
                    </Right>
                </ListItem>
            )
        }
    }
    requestKeyExtractor = (item) => item.id;

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
                    <BasicHeader title='Friends' searchIconProps={{ name: 'search', type: 'FontAwesome', onPress: () => this.setState({ headerSearchMode: true }) }} searchbarMode={headerSearchMode}
                        searchValue={searchQuery} onChangeSearchValue={(val) => this.setState({ searchQuery: val })} onCancelSearchMode={() => this.setState({ headerSearchMode: false, searchQuery: '' })}
                        onClearSearchValue={() => this.setState({ searchQuery: '' })}
                        rightIconProps={{ name: 'md-exit', type: 'Ionicons', style: { fontSize: widthPercentageToDP(8), color: '#fff' }, onPress: this.onPressLogout }} />

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
                                            backgroundColor: 'red', top: 1, left: 15, borderWidth: 2.5, borderColor: '#fff', justifyContent: 'center', alignItems: 'center', padding: 7
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
                                    keyExtractor = {this.requestKeyExtractor}
                                />
                            </View>
                        </Tab>
                    </Tabs>
                    {
                        this.state.selectedPersonImg
                            ? <Tabs locked={true} onChangeTab={this.onChangeFriendsTab} style={styles.bottomTabContainer} tabBarPosition='bottom' renderTabBar={() => <ScrollableTab ref={elRef => this.friendsTabsRef = elRef} style={{ backgroundColor: '#6C6C6B' }} underlineStyle={{ height: 0 }} />}>
                                <Tab heading={<TabHeading style={[styles.bottomTab, { height: BOTTOM_TAB_HEIGHT, backgroundColor: friendsActiveTab === 0 ? '#0083CA' : '#6C6C6B' }]}>
                                    <Text style={{ color: '#fff' }}>PROFILE</Text>
                                </TabHeading>}>
                                    <View style={styles.fill}>
                                        <View style={{ flex: 2, zIndex: 1000 }} ref={elRef => this.viewImage = elRef}>
                                            <ImageBackground style={{ flex: 1 }} source={require('../../assets/img/profile-bg.png')}>
                                                <Animated.Image
                                                    source={require('../../assets/img/friend-profile-pic.png')}
                                                    style={[{ resizeMode: 'cover', top: 0, left: 0, height: null, width: null, borderRadius: 15 }, activeImageStyle]}
                                                ></Animated.Image>
                                            </ImageBackground>
                                            <TouchableWithoutFeedback onPress={this.closeProfile}>
                                                <Animated.View style={[{ position: 'absolute', top: 30, right: 30 }, animatedCrossOpacity]}>
                                                    <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#fff' }}>X</Text>
                                                </Animated.View>
                                            </TouchableWithoutFeedback>
                                        </View>
                                        <Animated.View style={[{ flex: 1, zIndex: 900, backgroundColor: '#fff', padding: 20, paddingTop: 50, paddingBotton: 10 }, animatedContentStyle]}>
                                            <Text>TESING TEXT CONTENT</Text>
                                        </Animated.View>
                                    </View>
                                </Tab>
                                <Tab heading={<TabHeading style={[styles.bottomTab, { height: BOTTOM_TAB_HEIGHT, backgroundColor: friendsActiveTab === 1 ? '#0083CA' : '#6C6C6B', borderLeftWidth: 2, borderLeftColor: '#fff', borderRightWidth: 2, borderRightColor: '#fff' }]}>
                                    <Text style={{ color: '#fff' }}>GARAGE</Text>
                                </TabHeading>}>
                                    <View style={{ backgroundColor: '#fff', flex: 1 }}>
                                        <Text>GARAGE</Text>
                                    </View>
                                </Tab>
                                <Tab heading={<TabHeading style={[styles.bottomTab, { height: BOTTOM_TAB_HEIGHT, backgroundColor: friendsActiveTab === 2 ? '#0083CA' : '#6C6C6B' }]}>
                                    <Text style={{ color: '#fff' }}>RIDES</Text>
                                </TabHeading>}>
                                    <View style={{ backgroundColor: '#fff', flex: 1 }}>
                                        <Text>RIDES</Text>
                                    </View>
                                </Tab>
                            </Tabs>
                            : null
                    }
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
        cancelRequest: (userId, personId,requestId) => dispatch(cancelFriendRequest(userId, personId,requestId)),
        approvedRequest: (userId, personId, actionDate, requestId) => dispatch(approveFriendRequest(userId, personId, actionDate, requestId)),
        rejectRequest: (userId, personId,requestId) => dispatch(rejectFriendRequest(userId, personId, requestId)),
        getPicture: (userId, accessToken) => dispatch(getPicture(userId)),
    };
}
export default connect(mapStateToProps, mapDispatchToProps)(Friends);