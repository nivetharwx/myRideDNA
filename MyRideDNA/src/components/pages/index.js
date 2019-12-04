import React from 'react';
import { StyleSheet, SafeAreaView, View, ScrollView, FlatList, TouchableOpacity, Text } from 'react-native';
import { Icon as NBIcon, List, ListItem, Left, Body } from 'native-base';
import { WindowDimensions, APP_COMMON_STYLES, heightPercentageToDP, widthPercentageToDP, CUSTOM_FONTS } from '../../constants';
import { DefaultText } from '../labels';

const styles = StyleSheet.create({
    searchResults: {
        // backgroundColor: '#fff',
        // opacity: 0.9
    },
    primaryText: {
        marginLeft: 5,
        fontFamily:CUSTOM_FONTS.roboto,
        color: '#FFF'
    },
    secondaryText: {
        fontStyle: 'italic',
        color: '#FFF'
    },
    leftContainer: {
        borderLeftColor: '#FFF',
        height: '100%',
    },
    leftIcon: {
        fontSize: 20,
        color: '#FFF',
    },
    distance: {
        fontSize: 12
    },
    searchResultsContainer: {
        position: 'absolute',
        top: 130,
        marginTop: 62,
        zIndex: 100,
        width: '100%',
        height: heightPercentageToDP(100) - 130,
        backgroundColor: 'transparent',
        backgroundColor: 'rgba(0,0,0,0.8)',
    },
    closeIcon: {
        alignSelf: 'flex-end',
        marginRight: 10
    }
});
const CATEGORY_ICONS = {
    default: { name: 'location-on', type: 'MaterialIcons', style: styles.leftIcon },

};
export const SearchResults = ({ data, onPressClose, onSelectItem, style }) => (
    <View style={[styles.searchResultsContainer, style]}>
        <TouchableOpacity style={styles.closeIcon} onPress={onPressClose}>
            <NBIcon name='close' style={{ color: '#fff' }} />
        </TouchableOpacity>
        <View style={styles.searchResults}>
            <FlatList
                keyboardShouldPersistTaps={'handled'}
                style={{ marginTop: widthPercentageToDP(4) }}
                contentContainerStyle={{ paddingBottom: data.length > 0 ? heightPercentageToDP(8) : 0 }}
                data={data}
                keyExtractor={item => item.id}
                renderItem={({ item }) => {
                    return (
                        <ListItem button avatar style={{ marginTop: 10, height: heightPercentageToDP(8) }} onPress={() => onSelectItem(item)}>
                            <Left style={styles.leftContainer}>
                                <NBIcon {...CATEGORY_ICONS.default} />
                            </Left>
                            <Body style={{ height: '100%' }}>
                                <DefaultText style={styles.primaryText}>{item.place_name}</DefaultText>
                                {/* <DefaultText  style={styles.secondaryText}>{item.properties.category || ''}</DefaultText> */}
                            </Body>
                        </ListItem>
                    );
                }}
            />
        </View>
    </View>
);