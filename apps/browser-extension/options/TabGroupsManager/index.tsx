import DeleteIcon from "@mui/icons-material/Delete"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"
import OpenInNewIcon from "@mui/icons-material/OpenInNew"
import { IconButton, Typography } from "@mui/material"
import Accordion from "@mui/material/Accordion"
import AccordionDetails from "@mui/material/AccordionDetails"
import AccordionSummary from "@mui/material/AccordionSummary"
import List from "@mui/material/List"
import ListItem from "@mui/material/ListItem"
import ListItemText from "@mui/material/ListItemText"
import type { IBookmark } from "api-types"
import { useEffect, useMemo, useState } from "react"

import { sendToBackground } from "@plasmohq/messaging"

import type {
  TabGroupGetRequestBody,
  TabGroupGetResponseBody
} from "~background/messages/tab-group/get"
import { getStorage, TAB_GROUP_MAP_KEY } from "~storage"

import { getTabGroupColor } from "./utils"

// export const TabGroupsManager = () => {
//   const [tabGroups, setTabGroups] = useState([])

//   useEffect(() => {
//     // 获取当前的标签组
//     chrome.tabGroups.query({}, (groups) => {
//       setTabGroups(groups)
//     })
//   }, [])

//   const openTabGroup = (groupId) => {
//     // 打开标签组中的所有标签页
//     chrome.tabs.query({ groupId }, (tabs) => {
//       tabs.forEach((tab) => {
//         chrome.tabs.update(tab.id, { active: true })
//       })
//     })
//   }

//   return (
//     <List>
//       {tabGroups.map((group) => (
//         <ListItem key={group.id} button>
//           <ListItemText primary={group.title || `Group ${group.id}`} />
//           <IconButton
//             edge="end"
//             aria-label="open"
//             onClick={() => openTabGroup(group.id)}>
//             <OpenInNewIcon />
//           </IconButton>
//         </ListItem>
//       ))}
//     </List>
//   )
// }

const instance = getStorage()

export const TabGroupsManager = () => {
  const [tabGroups, setTabGroups] = useState<{
    [tabTitle: string]: IBookmark[]
  }>({})

  const tabTitles = useMemo(() => Object.keys(tabGroups), [tabGroups])

  useEffect(() => {
    // // 获取当前的标签组
    // chrome.tabGroups.query({}, (groups) => {
    //   setTabGroups(groups);
    // });
    // // 获取所有标签页
    // chrome.tabs.query({}, (allTabs) => {
    //   setTabs(allTabs);
    // });
    const main = async () => {
      const result = await sendToBackground<
        TabGroupGetRequestBody,
        TabGroupGetResponseBody
      >({
        name: "tab-group/get"
      })

      if (result.status === "success") {
        setTabGroups(result.data.tabGroups)
      }
    }

    main()
  }, [])

  const openTabGroup = async (tabTitle: string) => {
    const tabGroupBookmarks = tabGroups[tabTitle]
    // 打开标签组中的所有标签页
    const tabIds = []
    for (const bookmark of tabGroupBookmarks) {
      const tab = await chrome.tabs.create({ url: bookmark.url })
      tabIds.push(tab.id)
    }

    const groupId = await chrome.tabs.group({
      tabIds
    })
    const group = await chrome.tabGroups.update(groupId, {
      title: tabTitle,
      color: getTabGroupColor()
    })
    const tabGroupMap =
      (await instance.get<{ [groupId: number]: chrome.tabGroups.TabGroup }>(
        TAB_GROUP_MAP_KEY
      )) ?? {}
    console.info(" optinos tabGroupMap", tabGroupMap)
    tabGroupMap[groupId] = group;
    instance.set(TAB_GROUP_MAP_KEY, tabGroupMap)
  }

  const handleRemoveTabGroup = async (e, group) => {
    e.stopPropagation()
    const result =
      await instance.get<Map<number, chrome.tabGroups.TabGroup>>(
        TAB_GROUP_MAP_KEY
      )
    console.info(result)
    // TODO: remove tab group
  }

  return (
    <List>
      {tabTitles.map((group) => (
        <Accordion key={group}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel1a-content"
            id="panel1a-header">
            <ListItemText
              primary={<Typography variant="h6">{group}</Typography>}
            />
            <IconButton
              edge="end"
              aria-label="open"
              onClick={(e) => {
                e.stopPropagation()
                openTabGroup(group)
              }}>
              <OpenInNewIcon />
            </IconButton>
            <IconButton
              edge="end"
              sx={{ marginLeft: "5px" }}
              aria-label="open"
              onClick={(e) => handleRemoveTabGroup(e, group)}>
              <DeleteIcon></DeleteIcon>
            </IconButton>
          </AccordionSummary>
          <AccordionDetails>
            <List component="div" disablePadding>
              {tabGroups[group].map((tab) => (
                <ListItem key={tab.id} button>
                  <ListItemText primary={tab.title} secondary={tab.url} />
                </ListItem>
              ))}
            </List>
          </AccordionDetails>
        </Accordion>
      ))}
    </List>
  )
}
