import Box from "@mui/material/Box"
import Tab from "@mui/material/Tab"
import Tabs from "@mui/material/Tabs"
import Typography from "@mui/material/Typography"
import { useState } from "react"

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`
  }
}

export interface BookmarkTabProps {
    value: TabValues;
    onChange?: (value: TabValues) => void;
}

export enum TabValues {
    CREATE_BOOKMARK,
    CREATE_TAB_GROUPS
}

export const BookmarkTab = ({ onChange, value }: BookmarkTabProps) => {
  const handleChange = (event: React.SyntheticEvent, newValue: TabValues) => {
    onChange && onChange(newValue);
  }
  return (
    <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
      <Tabs
        value={value}
        onChange={handleChange}
        aria-label="basic tabs example">
        <Tab value={TabValues.CREATE_BOOKMARK} label="创建书签" {...a11yProps(0)} />
        <Tab value={TabValues.CREATE_TAB_GROUPS} label="创建分组" {...a11yProps(1)} />
      </Tabs>
    </Box>
  )
}
