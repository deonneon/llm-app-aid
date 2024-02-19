"use client";

import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Image,
  Font,
} from "@react-pdf/renderer";
import { Problem } from "../types/problem";

interface WorksheetPDFProps {
  problems: Problem[];
  rows: number;
  columns: number;
  backgroundImage: string;
  borderVisible: boolean;
  showAnswers: boolean;
  fontSize: number;
  fontType: string;
  nameHeader: boolean;
  dateHeader: boolean;
}

// Font.register({ family: 'Roboto', src: source });

const styles = StyleSheet.create({
  page: {
    position: "relative",
    padding: 0,
    backgroundColor: "#ffffff",
  },
  row: {
    flexDirection: "row",
    width: "100%",
    alignItems: "flex-start",
  },
  problem: {
    flexGrow: 1,
    flexBasis: "0%",
    margin: 5,
    padding: 15,
  },
  backgroundImage: {
    position: "absolute",
    width: "100%",
    height: "99.99%", // workaround - 100% causes a second page
    top: 0,
    left: 0,
    zIndex: -1,
  },
});

const WorksheetPDF: React.FC<WorksheetPDFProps> = ({
  problems,
  rows,
  columns,
  backgroundImage,
  borderVisible,
  showAnswers,
  fontSize,
  fontType,
  nameHeader,
  dateHeader,
}) => {
  const problemWidth = `${100 / columns}%`;

  const dynamicStyles = StyleSheet.create({
    problem: {
      flexGrow: 1,
      flexBasis: problemWidth,
      margin: 15,
      padding: 15,
      backgroundColor: "#FFFFFF",
      borderRadius: 20,
      borderWidth: borderVisible ? 2 : 0,
      borderColor: "#DDDDDD",
      boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
    },
    problemText: {
      fontSize: fontSize,
      fontFamily: fontType,
      marginBottom: 5,
    },
    optionsText: {
      fontSize: fontSize - 2, // slightly smaller than the problem text
      fontFamily: fontType,
      marginLeft: 20,
      marginBottom: 5,
    },
    headerText: {
      fontSize: fontSize,
      fontFamily: fontType,
      margin: 10, // Adjust as necessary for your layout
    },
  });

  // Create a grid of problems based on rows and columns
  const renderProblemsGrid = () => {
    let grid = [];

    for (let row = 0; row < rows; row++) {
      let rowProblems = problems.slice(row * columns, (row + 1) * columns);
      grid.push(
        <View key={row} style={styles.row}>
          {rowProblems.map((problem, col) => {
            const currentIndex = row * columns + col;
            return (
              <View
                wrap={false}
                key={currentIndex}
                style={dynamicStyles.problem}
              >
                <Text style={dynamicStyles.problemText}>
                  {currentIndex + 1}. {problem.problem}
                </Text>
                {problem.options &&
                  Object.keys(problem.options).length > 0 &&
                  Object.entries(problem.options).map(([key, value]) => (
                    <Text key={key} style={dynamicStyles.optionsText}>
                      {key.toUpperCase()}: {value}
                    </Text>
                  ))}
                {showAnswers && (
                  <Text style={dynamicStyles.problemText}>
                    Answer: {problem.answer}
                  </Text>
                )}
              </View>
            );
          })}
        </View>,
      );
    }
    return grid;
  };

  const renderHeaders = () => (
    <View style={{ flexDirection: "column", margin: 10 }}>
      {nameHeader && (
        <Text style={dynamicStyles.headerText}>Name: ________________</Text>
      )}
      {dateHeader && (
        <Text style={dynamicStyles.headerText}>Date: ________________</Text>
      )}
    </View>
  );

  return (
    <Document>
      <Page size="A4" wrap style={styles.page}>
        {/* eslint-disable-next-line jsx-a11y/alt-text */}
        <Image fixed src={backgroundImage} style={styles.backgroundImage} />
        {renderHeaders()}
        {renderProblemsGrid()}
      </Page>
    </Document>
  );
};

export default WorksheetPDF;
