// ════════════════════════════════════════════════════════════════
//  SAVE / LOAD
// ════════════════════════════════════════════════════════════════

function saveGame(){
  try{localStorage.setItem('finlife_save',JSON.stringify({char:GS.char,inv:GS.inv,nwHistory:GS.nwHistory,inbox:GS.inbox,billAccum:GS.billAccum,inboxPrefs:GS.inboxPrefs}));}catch(e){}
}
function loadGame(){
  try{const d=localStorage.getItem('finlife_save');if(!d)return false;const p=JSON.parse(d);GS.char=p.char;GS.inv=p.inv||createInvState();GS.nwHistory=p.nwHistory||[];GS.inbox=p.inbox||[];GS.billAccum=p.billAccum||[];GS.inboxPrefs=p.inboxPrefs||{showRed:true,showBlue:true,showOrange:true};
    // Migrations for older saves
    if(!GS.inv.sponsors) GS.inv.sponsors=[];
    if(GS.inv.sponsorOffersMonth===undefined) GS.inv.sponsorOffersMonth=-1;
    for(const b of (GS.inv.businesses||[])){
      if(b.equipTier===undefined){ b.equipTier=1; b.equipAge=0; }
    }
    return true;
  }catch(e){return false;}
}

