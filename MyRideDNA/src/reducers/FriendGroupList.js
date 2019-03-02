import { REPLACE_FRIEND_GROUP_LIST, ADD_FRIEND_GROUP_TO_LIST, ADD_MEMBERS_TO_CURRENT_GROUP, UPDATE_MEMBER_IN_CURRENT_GROUP, UPDTAE_CURRENT_GROUP, RESET_CURRENT_GROUP, RESET_MEMBERS_FROM_CURRENT_GROUP, RESET_MEMBERS_IN_CURRENT_GROUP, GET_GROUP_INFO, REMOVE_MEMBER_FROM_CURRENT_GROUP } from "../actions/actionConstants";

const initialState = {
    friendGroupList: [],
    currentGroup: null,
};

export default (state = initialState, action) => {
    switch (action.type) {
        case REPLACE_FRIEND_GROUP_LIST:
            return {
                ...state,
                friendGroupList: action.data.map(group => {
                    if (!group.groupMembers) group.groupMembers = [];
                    return group;
                }),
                // friendGroupList: [
                //     { groupName: 'Group 1', grouupId: 1, groupMembers: [] },
                //     { groupName: 'Group 2', grouupId: 2, groupMembers: [] },
                //     { groupName: 'Group 3', grouupId: 3, groupMembers: [] },
                //     { groupName: 'Group 4', grouupId: 4, groupMembers: [] },
                //     { groupName: 'Group 5', grouupId: 5, groupMembers: [] },
                //     { groupName: 'Group 6', grouupId: 6, groupMembers: [] },
                //     { groupName: 'Group 7', grouupId: 7, groupMembers: [] },
                //     { groupName: 'Group 8', grouupId: 8, groupMembers: [] },
                //     { groupName: 'Group 9', grouupId: 9, groupMembers: [] },
                //     { groupName: 'Group 10', grouupId: 10, groupMembers: [] },
                // ],
                currentGroup: null
            }
        case ADD_FRIEND_GROUP_TO_LIST:
            if (!action.data.groupMembers) action.data.groupMembers = [];
            return {
                ...state,
                friendGroupList: [
                    ...state.friendGroupList,
                    action.data
                ],
                currentGroup: action.data
            }
        case RESET_CURRENT_GROUP:
            return {
                ...state,
                currentGroup: null
            }
        case UPDTAE_CURRENT_GROUP:
            return {
                ...state,
                currentGroup: { ...state.currentGroup, ...action.data }
            }
        case RESET_MEMBERS_IN_CURRENT_GROUP:
            action.data[0].name = 'You';
            action.data[0].nickname = '';
            return {
                ...state,
                currentGroup: { ...state.currentGroup, groupMembers: action.data }
            }
        case ADD_MEMBERS_TO_CURRENT_GROUP:
            return {
                ...state,
                currentGroup: { ...state.currentGroup, groupMembers: [...state.currentGroup.groupMembers, ...action.data] }
            }
        case REMOVE_MEMBER_FROM_CURRENT_GROUP:
            const memberIndex = state.currentGroup.groupMembers.findIndex(member => member.memberId === action.data);
            if (memberIndex > -1) {
                return {
                    ...state,
                    currentGroup: {
                        ...state.currentGroup,
                        groupMembers: [
                            ...state.currentGroup.groupMembers.slice(0, memberIndex),
                            ...state.currentGroup.groupMembers.slice(memberIndex + 1)
                        ]
                    }
                }
            }
            return state
        case UPDATE_MEMBER_IN_CURRENT_GROUP:
            const memberIdx = state.currentGroup.groupMembers.findIndex(member => member.memberId === action.data.memberId);
            if (memberIdx > -1) {
                return {
                    ...state,
                    currentGroup: {
                        ...state.currentGroup,
                        groupMembers: [
                            ...state.currentGroup.groupMembers.slice(0, memberIdx),
                            { ...state.currentGroup.groupMembers[memberIdx], ...action.data.updates },
                            ...state.currentGroup.groupMembers.slice(memberIdx + 1)
                        ]
                    }
                }
            }
            return state
        case GET_GROUP_INFO:
            return {
                ...state,
                currentGroup: state.friendGroupList[action.data]
            }
        default: return state
    }
}