import { useEffect, useState } from "react"
import Bookmark from './Bookmark';
import { sendToBackground } from "@plasmohq/messaging"

import './index.less';


function IndexPopup() {
  // useEffect(() => {
  //   const main = async () => {
  //     await sendToBackground({ name: 'popup-open' });
  //   };
  //   main();
  // }, []);

  return (
    <Bookmark></Bookmark>
  );
}

export default IndexPopup
