import styled from "styled-components";

import { device } from "./globals.js";

// STYLES FOR CALENDAR PAGE

export const CalendarContainer = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  align-content: center;
  overflow: auto;
`;

export const TopNavContainer = styled.div`
  width: 100%;
  display: flex;
  align-items: baseline;
  justify-content: center;

  @media ${device.mobileL} {
    justify-content: space-between;
  }
`;

export const TopNavHeader = styled.h1`
  min-width: 380px;
  align-self: baseline;
  margin-left: calc(50% - 200px);
  color: black;

  @media ${device.tablet} {
    font-size: 23px;
    min-width: 260px;
    margin-left: calc(50% - 158px);
  }

  @media ${device.mobileL} {
    margin-left: 16px;
    font-size: 21px;
    min-width: 200px;
  }
`;

export const ButtonContainer = styled.div`
  margin-left: auto;
  align-self: baseline;

  @media ${device.tablet} {
    max-width: 92px;
  }
`;

export const HoOButton = styled.button`
  border: none;
  cursor: pointer;
  outline: none;
`;

export const GridContainer = styled.div`
  display: grid;
  width: 100%;
  grid-template-column: repeat(8, 1fr);
  grid-template-rows: repeat(${props => props.rows}, 70px);
  padding: 1% 0;
  place-items: stretch stretch;
  place-content: stretch stretch;
`;

export const GridItemHeader = styled.div`
  grid-column-start: ${props => props.column};
  grid-column-end: ${props => props.column};
  grid-row: 1 / span 1;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  border-bottom: ${props => (props.column > 1 ? "1px solid #ddd" : "none")};
`;

export const GridItemHeaderDate = styled.div`
  font-size: 30px;
  @media ${device.tablet} {
    font-size: 24px;
  }
`;

export const GridItemHeaderDay = styled.div`
  font-size: 16px;
  @media ${device.tablet} {
    content: "M";
    font-size: 13px;
  }
`;

export const GridItemOpenShift = styled.div`
  grid-row-start: ${props => props.row};
  grid-row-end: ${props => props.row};
  grid-column-start: 1;
  grid-column-end: 1;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;

  // THE FOLLOW ARE STYLINGS FOR THE OPEN SHIFT
  // background: #e0f6d8;
  // color: #0c881d;
  // border: #bfecaf solid 1px;
  // border-right: #76db56 solid 2px;
  // padding: 4px 6px;
  // font-size: 12px;
  // z-index: 1;

  &::after {
    background: #ddd;
    content: "";
    height: 5px;
    width: 5px;
    position: absolute;
    right: -2.5px;
    bottom: -5px;
    transform: translateY(-50%);
    border-radius: 50%;
  }
`;

export const GridItemOpenShiftHeader = styled.h3`
  @media ${device.mobileL} {
    // TODO: do some stuff here?
  }
`;

export const GridItemEmployee = styled.div`
  grid-row-start: ${props => props.row};
  grid-row-end: ${props => props.row};
  grid-column-start: 1;
  grid-column-end: 1;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;

  &::after {
    background: #ddd;
    content: "";
    height: 5px;
    width: 5px;
    position: absolute;
    right: -2.5px;
    bottom: -5px;
    transform: translateY(-50%);
    border-radius: 50%;
  }
`;

export const GridItemShift = styled.div`
  grid-row-start: ${props => props.row};
  grid-row-end: ${props => props.row};
  grid-column-start: ${props => props.column};
  grid-column-end: ${props => props.column};
  border-bottom: 1px solid #ddd;
  border-right: 1px solid #ddd;

  &:hover {
    background: #f6f6f6;
    cursor: pointer;
  }
`;

// TODO: REFACTOR BELOW
export const PostShiftContainer = styled.div`
  height: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
`;

export const Form = styled.form`
  display: flex;
  justify-content: space-evenly;
  align-items: center;
  flex-direction: column;
  padding: 5%;
`;

export const FormItem = styled.div`
  margin: 5%;
`;