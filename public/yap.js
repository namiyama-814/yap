'use strict'
//一番下を表示
window.addEventListener('load', () => {
  window.scrollTo(0, document.body.scrollHeight);
});

//Enter + Ctrl(Macの場合はCommand)でメッセージ送信
const formElement = document.forms['message-form'];
const textareaElement = formElement.elements['content'];

textareaElement.addEventListener('keydown', (event) => {

  if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
    event.preventDefault();
    formElement.submit();
  }

});

//送信キーを押しているか判定
function isPressSubmitKey(event) {
  //Windowsの処理
  if (event.ctrlKey) {
    return true;
  };
  //Macの処理(MacのCommandキーはmetaKeyという名前)
  if (event.metaKey) {
    return true;
  }
}

// ツールチップの有効化
const tooltipTriggerElements = document.querySelectorAll('[data-bs-toggle="tooltip"]');
tooltipTriggerElements.forEach((tooltipTriggerElement) => {
  new bootstrap.Tooltip(tooltipTriggerElement);
});