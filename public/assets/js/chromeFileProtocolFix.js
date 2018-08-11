// In recent versions of Chrome, a change to the the security has resulted in 
// a bug that results in jQuery Mobile pages not being loaded when loaded from
// the file system
var isChrome = navigator.userAgent.toLowerCase().indexOf('chrome') > -1;
var isFileProtocol = document.location.protocol == 'file:';
if (isChrome && isFileProtocol) {
  $(document).bind('mobileinit',function(){
    $.mobile.pushStateEnabled = false;
  });
}
