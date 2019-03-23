import React, { Component } from 'react';
import { connect } from 'react-redux';
import { StyleSheet, TextInput, Animated, Text, Keyboard, FlatList, View, ImageBackground } from 'react-native';
import { IconButton } from '../../../components/buttons';
import { widthPercentageToDP, heightPercentageToDP, PageKeys } from '../../../constants';
import { ListItem, Left, Thumbnail, Body, Right, Icon as NBIcon, CheckBox, Toast } from 'native-base';
import { ThumbnailCard } from '../../../components/cards';
import { createFriendGroup, getFriendGroups, addMembers, getAllGroupMembers } from '../../../api';
import { Actions } from 'react-native-router-flux';

const CREATE_GROUP_WIDTH = widthPercentageToDP(9);
class GroupListTab extends Component {
    createSecAnim = new Animated.Value(CREATE_GROUP_WIDTH / 2);
    borderWidthAnim = new Animated.Value(0);
    createGrpInputRef = null;
    addMemberInputRef = null;
    isAddingGroup = false;
    defaultBtmOffset = widthPercentageToDP(8);
    constructor(props) {
        super(props);
        this.defaultBtmOffset = widthPercentageToDP(props.user.handDominance === 'left' ? 20 : 8);
        this.state = {
            selectedFriendList: [],
            searchFriendList: [],
            newGroupName: null,
            kbdBtmOffset: this.defaultBtmOffset,
        };
    }

    componentDidMount() {
        this.props.getFriendGroups(this.props.user.userId);
    }

    adjustLayoutOnKeyboardVisibility = ({ endCoordinates }) => {
        this.setState({ kbdBtmOffset: endCoordinates.height });
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.friendGroupList !== this.props.friendGroupList) {
            if (this.isAddingGroup) {
                /** TODO: Open group details page with last group added
                 *  this.props.friendGroupList[this.props.friendGroupList.length - 1]
                 **/
            }
        }
    }

    addKeyboardListeners() {
        Keyboard.addListener('keyboardDidShow', this.adjustLayoutOnKeyboardVisibility);
        Keyboard.addListener('keyboardDidHide', this.adjustLayoutAndRemoveListeners);
    }

    adjustLayoutAndRemoveListeners = () => {
        this.setState({ kbdBtmOffset: this.defaultBtmOffset }, () => {
            Keyboard.removeListener('keyboardDidShow', this.adjustLayoutOnKeyboardVisibility);
            Keyboard.removeListener('keyboardDidHide', this.adjustLayoutAndRemoveListeners);
        });
    }

    componentWillUnmount() {
    }

    openGroupInfo = (index) => {
        if (this.borderWidthAnim.__getValue() > 0) {
            this.closeCreateGroupSection(() => Actions.push(PageKeys.GROUP, { grpIndex: index }));
        } else {
            Actions.push(PageKeys.GROUP, { grpIndex: index });
        }
    }

    openCreateGroupSection = () => {
        if (this.borderWidthAnim.__getValue() > 0) {
            this.closeCreateGroupSection();
            return;
        }
        Animated.parallel([
            Animated.timing(this.createSecAnim, {
                toValue: widthPercentageToDP(65),
                duration: 300
            }),
            Animated.timing(this.borderWidthAnim, {
                toValue: 1,
                duration: 300
            })
        ]).start(() => {
            this.addKeyboardListeners();
            this.setState({ newGroupName: '' });
            this.createGrpInputRef.focus();
        });
    }

    closeCreateGroupSection = (callback) => {
        Animated.parallel([
            Animated.timing(this.createSecAnim, {
                toValue: CREATE_GROUP_WIDTH / 2,
                duration: 300
            }),
            Animated.timing(this.borderWidthAnim, {
                toValue: 0,
                duration: 300
            })
        ]).start(() => {
            this.createGrpInputRef.clear();
            this.createGrpInputRef.blur();
            this.setState({ newGroupName: null });
            if (typeof callback === 'function') callback();
        });
    }

    renderGroup = ({ item, index }) => {
        return (
            <ListItem style={{ marginTop: 20 }} avatar onPress={() => this.openGroupInfo(index)}>
                <Left style={{ alignItems: 'center', justifyContent: 'center' }}>
                    {
                        item.groupProfilePictureThumbnail
                            ? <Thumbnail source={{ uri: 'Image URL' }} />
                            : <NBIcon active name="group" type='FontAwesome' style={{ width: widthPercentageToDP(6) }} />
                    }
                </Left>
                <Body>
                    <Text>{item.groupName}</Text>
                    <Text note></Text>
                </Body>
                <Right>
                    <Text note></Text>
                </Right>
            </ListItem>
        );
    }

    toggleFriendSelection = (index) => {
        let prevIndex = -1;
        this.setState(prevState => {
            prevIndex = prevState.selectedFriendList.findIndex(selFriend => prevState.searchFriendList[index].userId === selFriend.memberId);
            if (prevIndex === -1) {
                return {
                    selectedFriendList: [
                        ...prevState.selectedFriendList,
                        { memberId: prevState.searchFriendList[index].userId, isAdmin: false }
                    ]
                }
            } else {
                return {
                    selectedFriendList: [
                        ...prevState.selectedFriendList.slice(0, prevIndex),
                        ...prevState.selectedFriendList.slice(prevIndex + 1)
                    ]
                }
            }
        });
    }

    renderFriend = ({ item, index }) => {
        return (
            <ListItem avatar onPress={() => this.toggleFriendSelection(index)}>
                <Left style={{ alignItems: 'center', justifyContent: 'center' }}>
                    {
                        item.profilePictureThumbnail
                            ? <Thumbnail source={{ uri: 'Image URL' }} />
                            : <NBIcon active name="person" type='MaterialIcons' style={{ width: widthPercentageToDP(6), color: '#fff' }} />
                    }
                </Left>
                <Body>
                    <Text style={{ color: '#fff' }}>{item.name}</Text>
                    <Text style={{ color: '#fff' }} note></Text>
                </Body>
                <Right>
                    <CheckBox checked={this.state.selectedFriendList.findIndex(selFriend => selFriend.memberId === item.userId) > -1} />
                </Right>
            </ListItem>
        );
    }

    groupKeyExtractor = (item) => item.groupId;

    friendKeyExtractor = (item) => item.userId;

    memberKeyExtractor = (item) => item.memberId;

    onEnterGroupName = (val) => {
        this.setState({ newGroupName: val });
    }

    createGroup = () => {
        const { newGroupName } = this.state;
        this.closeCreateGroupSection(() => {
            if (newGroupName.trim().length === 0) {
                // Toast.show({
                //     text: 'Please provide a group name',
                //     buttonText: 'Okay'
                // });
            } else {
                this.isAddingGroup = true;
                this.props.createFriendGroup({
                    groupName: newGroupName,
                    createdBy: this.props.user.userId,
                    createdDate: new Date().toISOString(),
                });
            }
        });
    }

    render() {
        const { newGroupName } = this.state;
        const { friendGroupList, user } = this.props;
        const spinAnim = this.borderWidthAnim.interpolate({
            inputRange: [0, 1],
            outputRange: ['0deg', '45deg']
        });
        return (
            <View style={styles.fill}>
                {
                    friendGroupList.length > 0
                        ? <FlatList
                            data={friendGroupList}
                            keyExtractor={this.groupKeyExtractor}
                            renderItem={this.renderGroup}
                            extraData={this.state}
                        />
                        : <ImageBackground source={require('../../../assets/img/profile-bg.png')} style={styles.backgroundImage} />
                }
                <Animated.View style={[styles.createGrpContainer, { bottom: this.state.kbdBtmOffset, width: this.createSecAnim }]}>
                    <Animated.View style={[styles.createGrpActionSec, { backgroundColor: newGroupName === null ? 'transparent' : '#fff', borderWidth: this.borderWidthAnim }]}>
                        {
                            !newGroupName || newGroupName.trim().length === 0
                                ? <Animated.View style={[styles.createGroupIcon, styles.createGrpChildSize, { transform: [{ rotate: spinAnim }] }]}>
                                    <IconButton iconProps={{ name: 'plus', type: 'Entypo', style: { color: '#fff' } }} onPress={this.openCreateGroupSection}
                                        style={{ flex: 1 }} />
                                </Animated.View>
                                : <IconButton iconProps={{ name: 'check', type: 'Entypo', style: { color: '#fff' } }} onPress={this.createGroup}
                                    style={[styles.createGroupIcon, styles.createGrpChildSize]} />
                        }
                        <TextInput ref={elRef => this.createGrpInputRef = elRef} style={{ flex: 1, marginLeft: 3 }} onChangeText={this.onEnterGroupName} onSubmitEditing={this.createGroup} />
                    </Animated.View>
                </Animated.View>
            </View>
        )
    }
}

const mapStateToProps = (state) => {
    const { user } = state.UserAuth;
    const { friendGroupList, currentGroup } = state.FriendGroupList;
    const { allFriends } = state.FriendList;
    return { user, friendGroupList, allFriends, currentGroup };
};
const mapDispatchToProps = (dispatch) => {
    return {
        createFriendGroup: (newGroupInfo) => dispatch(createFriendGroup(newGroupInfo)),
        getFriendGroups: (userId) => dispatch(getFriendGroups(userId)),
        addMembers: (groupId, memberDetails) => dispatch(addMembers(groupId, memberDetails)),
        getAllGroupMembers: (groupId, userId) => dispatch(getAllGroupMembers(groupId, userId)),
    };
};
export default connect(mapStateToProps, mapDispatchToProps)(GroupListTab);

const styles = StyleSheet.create({
    fill: {
        flex: 1
    },
    createGrpContainer: {
        position: 'absolute',
        // bottom: widthPercentageToDP(20),
        marginRight: widthPercentageToDP(20),
        marginLeft: widthPercentageToDP(12.5),
        width: 0,
    },
    createGrpActionSec: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    createGroupIcon: {
        marginLeft: -CREATE_GROUP_WIDTH / 2,
        backgroundColor: '#81BB41',
        justifyContent: 'center',
        alignItems: 'center'
    },
    createGrpChildSize: {
        width: CREATE_GROUP_WIDTH,
        height: CREATE_GROUP_WIDTH,
        borderRadius: CREATE_GROUP_WIDTH / 2,
    },
    memberList: {
        marginHorizontal: widthPercentageToDP(5),
        paddingTop: widthPercentageToDP(5)
    },
    backgroundImage: {
        height: null,
        width: null,
        flex: 1
    }
});


{/* <ListItem avatar>
                <Left>
                    {
                        item.groupProfilePictureThumbnail
                            ? < Thumbnail source={{ uri: 'Image URL' }} />
                            : <NBIcon active name="group" type='FontAwesome' />
                    }
                </Left>
                <Body>
                    <Text>{item.groupName}</Text>
                    <Text note></Text>
                </Body>
                <Right>
                    <Text note>3</Text>
                </Right>
            </ListItem> */}