/**
 * Calendar Picker Component
 *
 * Copyright 2016 Yahoo Inc.
 * Licensed under the terms of the MIT license. See LICENSE file in the project root for terms.
 */
'use strict';

import React from 'react';
import {
  Dimensions,
  StyleSheet,
  View,
  Text,
  TouchableOpacity
} from 'react-native';

var {
  WEEKDAYS,
  MONTHS,
  MAX_ROWS,
  MAX_COLUMNS,
  getDaysInMonth
} = require('./Util');

import PropTypes from 'prop-types';

const makeStyles = require('./makeStyles');

//The styles in makeStyles are intially scaled to this width
const IPHONE6_WIDTH = 375;
const initialScale = Dimensions.get('window').width / IPHONE6_WIDTH ;
let styles = StyleSheet.create(makeStyles(initialScale));

class Day extends React.Component {

  static propTypes = {
    date: PropTypes.instanceOf(Date),
    onDayChange: PropTypes.func,
    maxDate: PropTypes.instanceOf(Date),
    minDate: PropTypes.instanceOf(Date),
    selected: PropTypes.bool,
    day: PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.string
    ]).isRequired,
    screenWidth: PropTypes.number,
    startFromMonday: PropTypes.bool,
    selectedDayColor: PropTypes.string,
    selectedDayTextColor: PropTypes.string,
    textStyle: Text.propTypes.style,
    currentDay: PropTypes.bool,
    isHighlighted: PropTypes.bool
  }

  constructor(props) {
    super(props);

    this.DAY_WIDTH = (this.props.screenWidth - 16)/7;
    this.SELECTED_DAY_WIDTH = (this.props.screenWidth - 16)/7 - 10;
    this.BORDER_RADIUS = this.SELECTED_DAY_WIDTH/2;
    return null;
  }


  render() {
    var textStyle = this.props.textStyle;
    let day = this.props.day.toString();// + 'a';

    const hihglight = this.props.isHighlighted
      ? <View style={[
        styles.dayHighlight,
        //this.props.dayHighlightStyle ? this.props.dayHighlightStyle : null
      ]}></View>
      : null;

    if (this.props.selected) {

      var selectedDayColorStyle = this.props.selectedDayColor ? {backgroundColor: this.props.selectedDayColor} : {};
      var selectedDayTextColorStyle = this.props.selectedDayTextColor ? {color: this.props.selectedDayTextColor} : {};
      return (
        <View style={styles.dayWrapper}>
          <View style={[styles.dayButtonSelected, selectedDayColorStyle]}>
            <TouchableOpacity
              style={styles.dayButton}
              onPress={() => this.props.onDayChange(this.props.day) }>
              <Text style={[styles.dayLabel, textStyle, selectedDayTextColorStyle]}>
                {day}
              </Text>

            </TouchableOpacity>
          </View>
          {hihglight}
        </View>
      );
    } else {

      let currentDayStyle = this.props.currentDay ? styles.currentDay : textStyle;

      if (this.props.date < this.props.minDate || this.props.date > this.props.maxDate) {
        return (
          <View style={styles.dayWrapper}>
            <Text style={[styles.dayLabel, textStyle, styles.disabledTextColor, currentDayStyle]}>
              {day}
            </Text>
            {hihglight}
          </View>
        );
      }
      else {
        return (
          <View style={styles.dayWrapper}>
            <TouchableOpacity
              style={styles.dayButton}
              onPress={() => this.props.onDayChange(this.props.day) }>
              <Text style={[styles.dayLabel, textStyle, currentDayStyle]}>
                {day}
              </Text>
            </TouchableOpacity>
            {hihglight}
          </View>
        );
      }
    }
  }
};

class Days extends React.Component {

  static propTypes = {
    maxDate: PropTypes.instanceOf(Date),
    minDate: PropTypes.instanceOf(Date),
    date: PropTypes.instanceOf(Date).isRequired,
    month: PropTypes.number.isRequired,
    year: PropTypes.number.isRequired,
    onDayChange: PropTypes.func.isRequired,
    selectedDayColor: PropTypes.string,
    selectedDayTextColor: PropTypes.string,
    textStyle: Text.propTypes.style,
    highlightedDays: PropTypes.array
  }

  constructor(props) {


    super(props);

    this.state = {
      selectedStates: []
    };


  }

  componentDidMount() {
    this.updateSelectedStates(this.props.date.getDate());
  }


  updateSelectedStates(day) {
    var selectedStates = [],
      daysInMonth = getDaysInMonth(this.props.month, this.props.year),
      i;

    for (i = 1; i <= daysInMonth; i++) {
      if (i === day) {
        selectedStates.push(true);
      } else {
        selectedStates.push(false);
      }
    }

    this.setState({
      selectedStates: selectedStates
    });

  }

  onPressDay(day) {
    this.updateSelectedStates(day);
    this.props.onDayChange({day: day});
  }

  // Not going to touch this one - I'd look at whether there is a more functional
  // way you can do this using something like `range`, `map`, `partition` and such
  // (see underscore.js), or just break it up into steps: first generate the array for
  // data, then map that into the components
  getCalendarDays() {
    var columns,
      matrix = [],
      i,
      j,
      month = this.props.month,
      year = this.props.year,
      currentDay = 0,
      thisMonthFirstDay = this.props.startFromMonday ? new Date(year, month, 0) : new Date(year, month, 1),
      slotsAccumulator = 0;

    var currentDate = new Date();
    currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());


    for (i = 0; i < MAX_ROWS; i++ ) { // Week rows
      columns = [];

      for (j = 0; j < MAX_COLUMNS; j++) { // Day columns
        if (slotsAccumulator >= thisMonthFirstDay.getDay()) {
          if (currentDay < getDaysInMonth(month, year)) {

            let date = new Date(year, month, currentDay + 1);


            const isHighlighted = this.props.highlightedDays
              ? this.props.highlightedDays.indexOf(date.getDate()) >= 0
              : false;

            columns.push(<Day
              key={'cpr-' + j}
              day={currentDay+1}
              selected={this.state.selectedStates[currentDay]}
              date={date}
              maxDate={this.props.maxDate}
              minDate={this.props.minDate}
              onDayChange={this.onPressDay.bind(this)}
              screenWidth={this.props.screenWidth}
              selectedDayColor={this.props.selectedDayColor}
              selectedDayTextColor={this.props.selectedDayTextColor}
              textStyle={this.props.textStyle}
              currentDay={date.getTime() == currentDate.getTime()}
              isHighlighted={isHighlighted}
            />);

            currentDay++;
          }
        } else {
          columns.push(<Day
            key={'cpr-' + j}
            day={''}
            screenWidth={this.props.screenWidth}/>);
        }

        slotsAccumulator++;
      }
      matrix[i] = [];
      matrix[i].push(<View key={'cpd-' + i} style={styles.weekRow}>{columns}</View>);
    }

    return matrix;
  }

  render() {
    return <View style={styles.daysWrapper}>{ this.getCalendarDays() }</View>;
  }

};

class WeekDaysLabels extends React.Component {

  static propTypes = {
    screenWidth: PropTypes.number,
    textStyle: Text.propTypes.style
  }


  render() {
    return (
      <View style={styles.dayLabelsWrapper}>
        { (this.props.weekdays || WEEKDAYS).map((day, key) => { return <Text key={key} style={[styles.dayLabels, this.props.textStyle]}>{day}</Text>; }) }
      </View>
    );
  }
};

class HeaderControls extends React.Component{

  static propTypes = {
    month: PropTypes.number.isRequired,
    year: PropTypes.number,
    day: PropTypes.number,
    getNextYear: PropTypes.func.isRequired,
    getPrevYear: PropTypes.func.isRequired,
    onMonthChange: PropTypes.func.isRequired,
    textStyle: Text.propTypes.style
  }

  constructor(props) {

    super(props);

    this.state = {
      selectedMonth: this.props.month
    };
  }

  // Logic seems a bit awkawardly split up between here and the CalendarPicker
  // component, eg: getNextYear is actually modifying the state of the parent,
  // could just let header controls hold all of the logic and have CalendarPicker
  // `onChange` callback fire and update itself on each change
  getNext() {
    var next = this.state.selectedMonth + 1;
    if (next > 11) {
      this.setState( { selectedMonth: 0 },
        // Run this function as a callback to ensure state is set first
        () => {
          this.props.getNextYear();
          this.props.onMonthChange(this.state.selectedMonth);
        }
      );
    } else {
      this.setState({ selectedMonth: next },
        () => {
          this.props.onMonthChange(this.state.selectedMonth);
        }
      );
    }
  }

  getPrevious() {
    var prev = this.state.selectedMonth - 1;
    if (prev < 0) {
      this.setState({ selectedMonth: 11},
        // Run this function as a callback to ensure state is set first
        () => {
          this.props.getPrevYear();
          this.props.onMonthChange(this.state.selectedMonth);
        }
      );
    } else {
      this.setState({ selectedMonth: prev },
        () => {
          this.props.onMonthChange(this.state.selectedMonth);
        }
      );
    }
  }

  previousMonthDisabled() {
    return ( this.props.minDate &&
      ( this.props.year < this.props.minDate.getFullYear() ||
        ( this.props.year == this.props.minDate.getFullYear() && this.state.selectedMonth <= this.props.minDate.getMonth() )
      )
    );
  }

  nextMonthDisabled() {
    return ( this.props.maxDate &&
      ( this.props.year > this.props.maxDate.getFullYear() ||
        ( this.props.year == this.props.maxDate.getFullYear() && this.state.selectedMonth >= this.props.maxDate.getMonth() )
      )
    );
  }

  render() {
    var textStyle = this.props.textStyle;

    var previous;
    if ( this.previousMonthDisabled() ) {
      previous = (
        <Text style={[styles.prev, textStyle, styles.disabledTextColor]}>{this.props.previousTitle || 'Previous'}</Text>
      );
    }
    else {
      previous = (
        <TouchableOpacity onPress={this.getPrevious.bind(this)}>
          <Text style={[styles.prev, textStyle]}>{this.props.previousTitle || 'Previous'}</Text>
        </TouchableOpacity>
      );
    }

    var next;
    if ( this.nextMonthDisabled() ) {
      next = (
        <Text style={[styles.next, textStyle, styles.disabledTextColor]}>{this.props.nextTitle || 'Next'}</Text>
      );
    }
    else {
      next = (
        <TouchableOpacity onPress={this.getNext.bind(this)}>
          <Text style={[styles.next, textStyle]}>{this.props.nextTitle || 'Next'}</Text>
        </TouchableOpacity>
      );
    }

    return (
      <View style={styles.headerWrapper}>
        <View style={styles.monthSelector}>
          {previous}
        </View>
        <View style={styles.monthLabelWrapper}>
          <Text style={[styles.monthLabel, textStyle]}>
            { (this.props.months || MONTHS)[this.state.selectedMonth] } {this.props.day}, { this.props.year }
          </Text>
        </View>
        <View style={styles.monthSelector}>
          {next}
        </View>

      </View>
    );
  }
};

export default class CalendarPicker extends React.Component {

  static propTypes = {
    maxDate: PropTypes.instanceOf(Date),
    minDate: PropTypes.instanceOf(Date),
    selectedDate: PropTypes.instanceOf(Date).isRequired,
    onDateChange: PropTypes.func,
    screenWidth: PropTypes.number,
    startFromMonday: PropTypes.bool,
    weekdays: PropTypes.array,
    months: PropTypes.array,
    previousTitle: PropTypes.oneOfType([
      PropTypes.object,
      PropTypes.string
    ]),
    nextTitle: PropTypes.oneOfType([
      PropTypes.object,
      PropTypes.string
    ]),
    selectedDayColor: PropTypes.string,
    selectedDayTextColor: PropTypes.string,
    scaleFactor: PropTypes.number,
    textStyle: Text.propTypes.style,
    makeStyle: PropTypes.func,
    highlightedDays: PropTypes.array
  }


  constructor(props) {

    super(props);

    if (this.props.scaleFactor !== undefined) {
      if (this.props.makeStyles != undefined) {
        styles = StyleSheet.create(this.props.makeStyles(this.props.scaleFactor));
      }
      else {
        styles = StyleSheet.create(makeStyles(this.props.scaleFactor));
      }
    }

    this.state = {
      date:  this.props.selectedDate,
      day:   this.props.selectedDate.getDate(),
      month: this.props.selectedDate.getMonth(),
      year:  this.props.selectedDate.getFullYear()
    };

  }


  onDayChange(day) {
    this.setState({day: day.day}, () => { this.onDateChange(); });
  }

  onMonthChange(month) {
    /*    let maxDayNewMonth = 30;
        let day = this.state.day;

        if ([0, 4, 6, 7, 9, 11].indexOf(month)) {
          maxDayNewMonth = 31;
        }
        else if (month == 1) {
          maxDayNewMonth = this.stateYear % 4 ? 29 : 28;
        }
        if (this.state.day > maxDayNewMonth) {
          day = maxDayNewMonth;
        }*/
    this.setState({month: month}, () => { this.onDateChange(); });
  }

  getNextYear(){
    this.setState({year: this.state.year + 1}, () => { this.onDateChange(); });
  }

  getPrevYear() {
    this.setState({year: this.state.year - 1}, () => { this.onDateChange(); });
  }

  onDateChange() {
    var {
        day,
        month,
        year
      } = this.state,
      date = new Date(year, month, day);

    this.setState({date: date});
    this.props.onDateChange(date);
  }

  render() {

    return (
      <View style={styles.calendar}>
        <HeaderControls
          maxDate={this.props.maxDate}
          minDate={this.props.minDate}
          year={this.state.year}
          month={this.state.month}
          day={this.state.day}
          onMonthChange={this.onMonthChange.bind(this)}
          getNextYear={this.getNextYear}
          getPrevYear={this.getPrevYear}
          months={this.props.months}
          previousTitle={this.props.previousTitle}
          nextTitle={this.props.nextTitle}
          textStyle={this.props.textStyle} />

        <WeekDaysLabels
          screenWidth={this.props.screenWidth}
          weekdays={this.props.weekdays}
          textStyle={this.props.textStyle} />

        <Days
          maxDate={this.props.maxDate}
          minDate={this.props.minDate}
          month={this.state.month}
          year={this.state.year}
          date={this.state.date}
          onDayChange={this.onDayChange.bind(this)}
          screenWidth={this.props.screenWidth}
          startFromMonday={this.props.startFromMonday}
          selectedDayColor={this.props.selectedDayColor}
          selectedDayTextColor={this.props.selectedDayTextColor}
          textStyle={this.props.textStyle}
          highlightedDays={this.props.highlightedDays ? this.props.highlightedDays : []}
        />

      </View>
    );
  }
};
