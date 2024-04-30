export const getTabGroupColor = (): chrome.tabGroups.ColorEnum => {
   const colors: chrome.tabGroups.ColorEnum[] = ['grey', 'blue', 'red', 'yellow', 'green', 'pink', 'purple', 'cyan', 'orange'];
   const randomNumber = Math.floor(Math.random() * colors.length);
   return colors[randomNumber]; 
}