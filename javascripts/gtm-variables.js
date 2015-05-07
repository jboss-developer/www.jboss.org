var gtm = {

  variables: function () {
    var projectCode = $( '.data-project-code' );
    if (projectCode.length) {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({ 'product_code' : projectCode.data("project-code") });
    }
  }
}

gtm.variables();

