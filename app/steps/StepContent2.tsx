// steps/StepContent2.tsx
import { useState } from "react";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import { styled } from "@mui/material/styles";
import TextField from "@mui/material/TextField";

type Alignment = "column" | "grid" | "rows";

interface StepContent2Props {
  alignment: Alignment; // Current alignment state passed from parent
  setAlignment: (newAlignment: Alignment) => void; // Method to update alignment in parent
  onRowsChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onColumnsChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onNumsetChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  rows: number;
  columns: number;
  numProblems: number;
}

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === "dark" ? "#1A2027" : "#fff",
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: "center",
  color: theme.palette.text.secondary,
}));

const StepContent2: React.FC<StepContent2Props> = ({
  alignment,
  setAlignment,
  rows,
  columns,
  numProblems,
  onRowsChange,
  onColumnsChange,
  onNumsetChange,
}) => {
  const handleChange = (
    event: React.MouseEvent<HTMLElement>,
    newAlignment: Alignment,
  ) => {
    setAlignment(newAlignment);
  };

  return (
    <>
      <h1 className="flex pb-7 pt-12 text-xl font-light">Details Config</h1>

      {/* Question format options */}
      <div className="flex w-full flex-row justify-between">
        <div className="p-2">Question Layout</div>
        <ToggleButtonGroup
          color="primary"
          value={alignment}
          exclusive
          onChange={handleChange}
          aria-label="Platform"
        >
          <ToggleButton value="column">Columns</ToggleButton>
          <ToggleButton value="grid">Grid</ToggleButton>
          <ToggleButton value="rows">Rows</ToggleButton>
        </ToggleButtonGroup>
      </div>
      <Stack spacing={2} className="flex max-h-[calc(100vh-21rem)] w-full py-4">
        <Item
          variant="outlined"
          className="flex flex-row items-center justify-between border"
        >
          <div className="p-2">Number of Questions</div>
          <TextField
            type="number"
            id="problems"
            variant="outlined"
            value={numProblems}
            onChange={onNumsetChange}
            InputProps={{ inputProps: { min: 1 } }}
          />
        </Item>
        <Item
          variant="outlined"
          className="flex flex-row items-center justify-between border"
        >
          <div className="p-2">Number of Columns</div>
          <TextField
            type="number"
            id="columns"
            variant="outlined"
            value={columns}
            onChange={onColumnsChange}
            InputProps={{ inputProps: { min: 1 } }}
          />
        </Item>
        <Item
          variant="outlined"
          className="flex flex-row items-center justify-between border"
        >
          <div className="p-2">Number of Rows</div>
          <TextField
            type="number"
            id="rows"
            variant="outlined"
            value={rows}
            onChange={onRowsChange}
            InputProps={{ inputProps: { min: 1 } }}
            disabled={columns === 1}
          />
        </Item>
        {/* <Item
          variant="outlined"
          className="flex flex-row items-center justify-between border"
        >
          <div className="p-2">Spacing</div>
          <TextField id="filled-basic" label="Filled" variant="filled" />
        </Item> */}
      </Stack>
    </>
  );
};

export default StepContent2;
