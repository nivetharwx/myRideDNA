import React from 'react';
import {
    View,
    Text,
    TextInput,
    Switch,
    StyleSheet,
    TouchableOpacity
} from 'react-native';
import { Icon as NBIcon, Picker, DatePicker } from 'native-base';
import { WindowDimensions, ShortMonthNames } from '../../constants';
import { getFormattedDateFromISO } from '../../util';

const getKeyboardTypeForContentType = (contentType) => {
    if (contentType === 'telephoneNumber' || contentType === 'postalCode' || contentType === 'creditCardNumber') {
        return 'number-pad';
    } else if (contentType === 'emailAddress') {
        return 'email-address';
    }
}

export const LabeledInput = ({ hideKeyboardOnSubmit, inputValue, containerStyle, label, labelStyle, placeholder, placeholderColor, inputStyle, inputType, returnKeyType, returnKeyLabel, onChange, onSubmit, inputRef, onFocus }) => (
    <View style={[{ flexDirection: 'row', marginBottom: 10, borderRadius: 5 }, containerStyle]}>
        <Text style={[{ alignSelf: 'center', marginRight: 10 }, labelStyle]}>{label}</Text>
        <TextInput onFocus={onFocus && onFocus} value={inputValue} blurOnSubmit={typeof hideKeyboardOnSubmit === 'undefined' ? true : hideKeyboardOnSubmit} secureTextEntry={inputType === 'password'} style={[{ flex: 1, borderBottomWidth: 1, borderBottomColor: '#acacac' }, inputStyle]}
            placeholderTextColor={placeholderColor} placeholder={placeholder} textContentType={inputType} keyboardType={getKeyboardTypeForContentType(inputType)}
            onChangeText={onChange && onChange} onSubmitEditing={({ nativeEvent }) => onSubmit && onSubmit(nativeEvent.text)}
            returnKeyType={returnKeyType || 'done'} returnKeyLabel={returnKeyLabel} ref={(el) => inputRef && inputRef(el)} />
    </View>
);
export const IconicInput = ({ inputColor, containerStyle, iconProps, placeholder, value, inputType, onChange, iconEnd, onFocusout }) => (
    <View style={[{ flexDirection: 'row', marginVertical: 10 }, containerStyle]}>
        {
            iconProps.onPress
                ? <TouchableOpacity style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }} onPress={iconProps.onPress}>
                    <NBIcon name={iconProps.name} type={iconProps.type} style={[styles.formFieldIcon, iconProps.style]} />
                </TouchableOpacity>
                : <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <NBIcon name={iconProps.name} type={iconProps.type} style={[styles.formFieldIcon, iconProps.style]} />
                </View>
        }
        <TextInput secureTextEntry={inputType === 'password'} style={{ flex: 10, borderBottomColor: '#D4D4D4', borderBottomWidth: 1, color: inputColor }}
            placeholder={placeholder} textContentType={inputType} value={value} onChangeText={(val) => onChange && onChange(val)} keyboardType={getKeyboardTypeForContentType(inputType)} onBlur={onFocusout} />
        {
            iconEnd
                ? iconEnd
                : null
        }
    </View>
);

// DOC: Controlled component, caller have to pass onValueChange function to persist the user selection
export const IconicList = ({ iconProps, values, selectedValue, placeholder, onChange }) => {
    let options = selectedValue ? values : [{ label: placeholder || 'Select any', value: '' }, ...values];
    return (
        <View>
            <View style={{ flexDirection: 'row', marginVertical: 10 }}>
                <View style={{ paddingLeft: 10, paddingRight: 5, justifyContent: 'center', alignItems: 'center' }}>
                    <NBIcon name={iconProps.name} type={iconProps.type} style={[styles.formFieldIcon, iconProps.style]} />
                </View>
                <Picker
                    mode="dropdown"
                    iosIcon={<NBIcon name="ios-arrow-down-outline" />}
                    placeholder={placeholder}
                    placeholderStyle={{ color: "#a9a9a9", marginLeft: 0, paddingLeft: 0 }}
                    placeholderIconColor="#a9a9a9"
                    style={{ width: WindowDimensions.width - 30, borderBottomWidth: 1, borderBottomColor: '#a9a9a9' }}
                    selectedValue={selectedValue}
                    onValueChange={onChange && onChange}
                >
                    {
                        options.map((option, index) => <Picker.Item key={option.value} label={option.label} value={option.value} />)
                    }
                </Picker>
            </View>
        </View>
    );
}

export const IconicSwitch = ({ iconProps, label, selectedValue, onChange }) => (
    <View style={{ flexDirection: 'row', marginVertical: 10 }}>
        <View style={{ paddingLeft: 10, paddingRight: 5, justifyContent: 'center', alignItems: 'center' }}>
            <NBIcon name={iconProps.name} type={iconProps.type} style={[styles.formFieldIcon, { flex: 1, marginRight: 10 }, iconProps.style]} />
        </View>
        <View style={{ flex: 1, alignSelf: 'center', flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text>{label}</Text>
            <Switch value={selectedValue} onValueChange={(value) => onChange(value)} style={{ alignSelf: 'center' }} />
        </View>
    </View>
);

// DOC: Controlled component, caller have to pass onValueChange function to persist the user selection
export const IconicDatePicker = ({ iconProps, selectedDate, selectedDateString, minDate, maxDate, placeholder, onChange }) => {
    let currentDate = new Date();
    return (
        <View>
            <View style={{ flexDirection: 'row', marginVertical: 10 }}>
                {
                    iconProps
                        ? <View style={{ paddingLeft: 10, paddingRight: 5, justifyContent: 'center', alignItems: 'center' }}>
                            <NBIcon name={iconProps.name} type={iconProps.type} style={[styles.formFieldIcon, iconProps.style]} />
                        </View>
                        : null
                }
                <DatePicker
                    defaultDate={selectedDateString ? new Date(selectedDateString) : selectedDate ? selectedDate : currentDate}
                    minimumDate={minDate || new Date(currentDate.getFullYear() - 100, currentDate.getMonth() + 1, currentDate.getDay())}
                    maximumDate={maxDate || currentDate}
                    locale={"en"}
                    timeZoneOffsetInMinutes={undefined}
                    modalTransparent={false}
                    animationType={"fade"}
                    androidMode={"default"}
                    placeHolderText={placeholder || selectedDate || (selectedDateString && getFormattedDateFromISO(new Date(selectedDateString).toISOString(), '/')) || 'Select date'}
                    textStyle={styles.datePickerDefaultStyles}
                    placeHolderTextStyle={[styles.datePickerDefaultStyles, { color: selectedDate || (selectedDateString && new Date(selectedDateString)) ? "black" : "#a9a9a9" }]}
                    onDateChange={onChange && onChange}
                />
            </View>
        </View>
    )
}

export const SearchBox = ({ value, hideIcon, onTextChange, onPressClear, style, hideBoxStyle }) => (
    <View style={[styles.searchBox, style]}>
        <View style={[styles.inputWrapper, hideBoxStyle ? null : styles.boxStyle]}>
            <View style={{ flexDirection: 'row' }}>
                {
                    hideIcon
                        ? null
                        : <NBIcon name='search' type='FontAwesome' style={styles.icon} />
                }
                <TextInput style={styles.inputSearch} value={value} placeholder='Search here' onChangeText={onTextChange} />
                <NBIcon name='close' style={styles.icon} onPress={onPressClear} />
            </View>
        </View>
    </View>
);

const styles = StyleSheet.create({
    formFieldIcon: {
        fontSize: 20,
        color: '#999999'
    },
    datePickerDefaultStyles: {
        marginLeft: 5,
        width: WindowDimensions.width,
        borderBottomColor: '#a9a9a9',
        borderBottomWidth: 1,
        color: 'black'
    },
    searchBox: {
        flex: 1,
    },
    inputWrapper: {
        backgroundColor: '#fff',
        opacity: 0.9,
    },
    boxStyle: {
        borderRadius: 7,
        borderColor: '#000',
        borderWidth: 1,
    },
    inputSearch: {
        fontSize: 14,
        flex: 1,
        marginRight: 10,
        minHeight: 40,
        marginLeft: 5
    },
    label: {
        fontSize: 10,
        fontStyle: 'italic',
        marginLeft: 10,
        marginTop: 10,
        marginBottom: 0,
    },
    icon: {
        color: '#000',
        fontSize: 18,
        alignSelf: 'center',
        paddingHorizontal: 10,
    }
});