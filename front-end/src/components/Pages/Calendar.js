import React, { Component } from "react";
import { connect } from "react-redux";

import Moment from "moment";
import { extendMoment } from "moment-range";

import { getShifts } from "../../store/Shift/actions.js";
import { getAllProfiles } from "../../store/Profile/actions.js";
import { getHoursOfOperation } from "../../store/hourOfOperation/actions.js";

import CalendarTopNav from "../Organisms/CalendarTopNav.js";
import ScheduleShift from "../Molecules/ScheduleShift.js";
import ScheduleShiftUpdate from "../Molecules/ScheduleShiftUpdate";

import {
  GridItemHeader,
  GridItemHeaderDay,
  GridItemHeaderDate,
  GridItemEmployee,
  GridItemOpenShift,
  GridContainer,
  GridItemOpenShiftHeader,
  ProfileIcon,
  ScheduleShiftGap,
} from "../../styles/Calendar.js";
import { CalendarContainer } from "../../styles/Calendar.js";

const moment = extendMoment(Moment);

// TODO: Make me more stylish
// TODO: Check HoO against shifts to make sure that the time is filled, if not render cell red
// TODO: Turn cell red if conflict with employee's time off
// TODO: Span shifts to multiple days
// TODO: Dynamic employees
// TODO: test CRUD

class Calendar extends Component {
  state = {
    date: moment().format(),
  };

  componentDidMount() {
    this.props.getAllProfiles();
    this.props.getShifts();
    this.props.getHoursOfOperation();
  }

  handleChangeDate = direction => {
    const newDate = moment(this.state.date);
    if (direction) newDate.add(7, "day");
    else newDate.subtract(7, "day");
    this.setState({ date: newDate.format() });
  };

  fillGrid = employees => {
    // This function takes the number of employees and fills the body of the table
    // There are 7 columns (First column is the row headers)
    // Rows = employees + 2 (one for column headers, one for open shifts)
    const output = [];
    for (let column = 2; column <= 7 + 1; column++) {
      for (let row = 2; row <= employees + 2; row++) {
        output.push(
          <ScheduleShift
            key={`${row}-${column}`}
            handleClick={this.handleClick}
            row={row}
            date={moment(this.state.date)
              .day(column - 1)
              .format()}
            profile={row > 2 ? this.props.allProfiles[row - 3].id : null}
          />
        );
      }
    }
    return output;
  };

  findGaps = () => {
    // This function takes the shifts in the current week and compares it against the HoO to find any gaps
    const currentDate = moment(this.state.date);
    const shiftsByDay = [[], [], [], [], [], [], []];
    const gapsByDay = [[], [], [], [], [], [], []];

    // Sorts shifts by day of the week
    // TODO: refactor this out to component scope so it isn't run twice
    this.props.allShifts.forEach((shift, index) => {
      const momentStart = moment(shift.start_datetime);
      const shiftInCurrentWeek = momentStart.isBetween(
        currentDate
          .clone()
          .day(1)
          .set({ hour: 0, minute: 0, "second:": 0, millisecond: 0 }),
        currentDate
          .clone()
          .day(7)
          .set({ hour: 23, minute: 59, "second:": 59, millisecond: 999 })
      );

      if (shiftInCurrentWeek) {
        // TODO: only take shifts that have been assigned ??
        const weekday = momentStart.isoWeekday();
        shiftsByDay[weekday - 1].push(
          moment.range(momentStart, moment(shift.end_datetime))
        );
      }
    });

    function getGapsFromRangesArray(start_time, end_time, ranges, index) {
      const HoO_start = currentDate
        .clone()
        .second(Number(`${start_time[6]}${start_time[7]}`))
        .minute(Number(`${start_time[3]}${start_time[4]}`))
        .hour(Number(`${start_time[0]}${start_time[1]}`))
        .isoWeekday(index);
      const HoO_end = currentDate
        .clone()
        .second(Number(`${end_time[6]}${end_time[7]}`))
        .minute(Number(`${end_time[3]}${end_time[4]}`))
        .hour(Number(`${end_time[0]}${end_time[1]}`))
        .isoWeekday(index);

      if (!ranges.length) {
        gapsByDay[index - 1].push(moment.range(HoO_start, HoO_end));
        return;
      }

      // Otherwise join together shifts for the day
      const sortedRanges = ranges.slice().sort(function(a, b) {
        if (a.start.format() > b.start.format()) return 1;
        else return -1;
      });

      const joinedRanges = [sortedRanges.shift()];

      while (sortedRanges.length) {
        const head = sortedRanges.shift();
        if (head.overlaps(joinedRanges[joinedRanges.length - 1])) {
          const newTail = joinedRanges.pop();
          joinedRanges.push(newTail.add(head));
        }
      }
      // TODO: Maybe handle shifts out of HoO here
      // push gaps between shifts to day of gapsByDay using the day's index
      if (joinedRanges.length) {
        if (HoO_start >= joinedRanges[0].start) {
          // if no gaps return
          if (HoO_end <= joinedRanges[0].end) return;
          for (let i = 0; i < joinedRanges.length - 1; i++) {
            gapsByDay[index - 1].push(
              moment.range(joinedRanges[i].end, joinedRanges[i + 1].start)
            );
          }
          gapsByDay[index - 1].push(
            moment.range(joinedRanges[joinedRanges.length - 1].end, HoO_end)
          );
        } else if (HoO_end <= joinedRanges[0].end) {
          gapsByDay[index - 1].push(
            moment.range(HoO_start, joinedRanges[0].start)
          );
          for (let i = 0; i < joinedRanges.length - 1; i++) {
            gapsByDay[index - 1].push(
              moment.range(joinedRanges[i].end, joinedRanges[i + 1].start)
            );
          }
        } else {
          gapsByDay[index - 1].push(
            moment.range(HoO_start, joinedRanges[0].start)
          );
          for (let i = 0; i < joinedRanges.length - 1; i++) {
            gapsByDay[index - 1].push(
              moment.range(joinedRanges[i].end, joinedRanges[i + 1].start)
            );
          }
          gapsByDay[index - 1].push(
            moment.range(joinedRanges[joinedRanges.length - 1].end, HoO_end)
          );
        }
      }
    }

    this.props.allHoOs.forEach((HoO, index) => {
      if (HoO.is_open) {
        const dayLookupTable = {
          M: 1,
          T: 2,
          W: 3,
          R: 4,
          F: 5,
          S: 6,
          U: 7,
        };
        getGapsFromRangesArray(
          HoO.open_time,
          HoO.close_time,
          shiftsByDay[dayLookupTable[HoO.day] - 1],
          dayLookupTable[HoO.day]
        );
      }
    });

    return gapsByDay;
  };

  render() {
    const currentDate = moment(this.state.date);
    return (
      <CalendarContainer>
        <CalendarTopNav
          changeDate={this.handleChangeDate}
          displayDate={this.state.date}
        />
        <GridContainer rows={this.props.allProfiles.length + 2}>
          {/* Refactor into molecules - Column Header */}
          <GridItemHeader column="1" />
          {/* Refactor - Dynamic */}
          <GridItemHeader column="2">
            <GridItemHeaderDay>Monday</GridItemHeaderDay>
            <GridItemHeaderDate>
              {
                moment(this.state.date)
                  .day(1)
                  .toObject().date
              }
            </GridItemHeaderDate>
          </GridItemHeader>
          <GridItemHeader column="3">
            <GridItemHeaderDay>Tuesday</GridItemHeaderDay>
            <GridItemHeaderDate>
              {
                moment(this.state.date)
                  .day(2)
                  .toObject().date
              }
            </GridItemHeaderDate>
          </GridItemHeader>
          <GridItemHeader column="4">
            <GridItemHeaderDay>Wednesday</GridItemHeaderDay>
            <GridItemHeaderDate>
              {
                moment(this.state.date)
                  .day(3)
                  .toObject().date
              }
            </GridItemHeaderDate>
          </GridItemHeader>
          <GridItemHeader column="5">
            <GridItemHeaderDay>Thursday</GridItemHeaderDay>
            <GridItemHeaderDate>
              {
                moment(this.state.date)
                  .day(4)
                  .toObject().date
              }
            </GridItemHeaderDate>
          </GridItemHeader>
          <GridItemHeader column="6">
            <GridItemHeaderDay>Friday</GridItemHeaderDay>
            <GridItemHeaderDate>
              {
                moment(this.state.date)
                  .day(5)
                  .toObject().date
              }
            </GridItemHeaderDate>
          </GridItemHeader>
          <GridItemHeader column="7">
            <GridItemHeaderDay>Saturday</GridItemHeaderDay>
            <GridItemHeaderDate>
              {
                moment(this.state.date)
                  .day(6)
                  .toObject().date
              }
            </GridItemHeaderDate>
          </GridItemHeader>
          <GridItemHeader column="8">
            <GridItemHeaderDay>Sunday</GridItemHeaderDay>
            <GridItemHeaderDate>
              {
                moment(this.state.date)
                  .day(7)
                  .toObject().date
              }
            </GridItemHeaderDate>
          </GridItemHeader>
          {/* Refactor into molecules - Row Header  */}
          <GridItemEmployee row="1" />
          <GridItemOpenShift row="2">
            <GridItemOpenShiftHeader>Open Shifts</GridItemOpenShiftHeader>
          </GridItemOpenShift>
          {this.props.allProfiles.map((profile, index) => {
            // Shift counter for this week
            let shiftCount = 0;
            this.props.allShifts.forEach((shift, index) => {
              const shiftInCurrentWeek = moment(shift.start_datetime).isBetween(
                currentDate
                  .clone()
                  .day(1)
                  .set({ hour: 0, minute: 0, "second:": 0, millisecond: 0 }),
                currentDate
                  .clone()
                  .day(7)
                  .set({
                    hour: 23,
                    minute: 59,
                    "second:": 59,
                    millisecond: 999,
                  })
              );
              if (shiftInCurrentWeek && shift.profile === profile.id) {
                shiftCount++;
              }
            });

            return (
              <GridItemEmployee
                row={index + 3}
                key={profile.user.last_name + index}
              >
                <ProfileIcon hue={(index + 3) * 40}>{shiftCount}</ProfileIcon>
                <h5>
                  {profile.user.first_name} {profile.user.last_name}
                </h5>
              </GridItemEmployee>
            );
          })}

          {/* Refactor into molecules - Body */}
          {this.fillGrid(this.props.allProfiles.length)}

          {this.props.allShifts.map((shift, index) => {
            const shiftInCurrentWeek = moment(shift.start_datetime).isBetween(
              currentDate
                .clone()
                .day(1)
                .set({ hour: 0, minute: 0, "second:": 0, millisecond: 0 }),
              currentDate
                .clone()
                .day(7)
                .set({ hour: 23, minute: 59, "second:": 59, millisecond: 999 })
            );
            if (shiftInCurrentWeek) {
              const profileRow =
                this.props.allProfiles.indexOf(
                  this.props.allProfiles.filter(
                    profile => profile.id === shift.profile
                  )[0]
                ) + 3;
              return (
                <ScheduleShiftUpdate
                  hue={profileRow ? profileRow * 40 : 102}
                  key={shift.id}
                  row={profileRow}
                  // add span to second day if applicable
                  column={moment(shift.start_datetime).isoWeekday() + 1}
                  justify={
                    moment(shift.start_datetime).format("k") <= 9
                      ? "flex-start"
                      : moment(shift.start_datetime).format("k") >= 17
                        ? "flex-end"
                        : "center"
                  }
                  start={shift.start_datetime}
                  end={shift.end_datetime}
                  notes={shift.notes}
                  profile={shift.profile}
                  id={shift.id}
                />
              );
            } else return null;
          })}

          {this.findGaps().map((dayOfGaps, index) => {
            const renderedGaps = [];
            if (dayOfGaps.length) {
              for (let i = 0; i < dayOfGaps.length; i++) {
                renderedGaps.push(
                  <ScheduleShiftGap
                    key={`gap ${index}-${i}`}
                    column={index + 2}
                    start={dayOfGaps[i].start.format("k")}
                    end={dayOfGaps[i].end.format("k")}
                    height={this.props.allProfiles.length}
                  />
                );
              }
            }
            return renderedGaps;
          })}
        </GridContainer>
      </CalendarContainer>
    );
  }
}

const mapStateToProps = state => {
  return {
    allShifts: state.shift.allShifts,
    allProfiles: state.profile.allProfiles,
    allHoOs: state.hourOfOperation.allHoOs,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    getShifts: () => {
      return dispatch(getShifts());
    },
    getAllProfiles: () => {
      return dispatch(getAllProfiles());
    },
    getHoursOfOperation: () => {
      return dispatch(getHoursOfOperation());
    },
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Calendar);
