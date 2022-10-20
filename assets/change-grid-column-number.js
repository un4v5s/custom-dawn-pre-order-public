function changeGridColumnNumberButtonClicked(target){
  const column_num = target.value;
  const btn3 = document.querySelector('.grid-column-number-selector-wrapper > button[name="3"]');
  const btn4 = document.querySelector('.grid-column-number-selector-wrapper > button[name="4"]');
  const elm = document.getElementById("product-grid");

  // column_num can be 3 or 4
  if(column_num == 3){
    let els = document.getElementsByClassName("grid--4-col-desktop")
    Array.prototype.forEach.call(els, elm => {
      elm.classList.remove("grid--4-col-desktop");
      elm.classList.add("grid--3-col-desktop");  
    })
    document.getElementsByClassName("vl")[0].innerText = "|||";    
    btn3.setAttribute("active", "");
    btn4.removeAttribute('active')
  }else{
    let els = document.getElementsByClassName("grid--3-col-desktop")
    Array.prototype.forEach.call(els, elm => {
      elm.classList.remove("grid--3-col-desktop");
      elm.classList.add("grid--4-col-desktop");  
    })
    // elm.classList.remove("grid--3-col-desktop");
    // elm.classList.add("grid--4-col-desktop");
    document.getElementsByClassName("vl")[0].innerText = "||||";
    btn3.removeAttribute('active')
    btn4.setAttribute("active", "");
  }
}