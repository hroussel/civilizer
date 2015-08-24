function setupPanelActivationButtons() {
	$("#panel-activation-buttons").buttonset();

    var activeCount = 0;
    for (var i = 0; i < 3; i++) {
        if (sessionStorage.getItem('panel-' + i) === "on") {
            ++activeCount;
            $("#panel-toggler-" + i).prop("checked", true);
        }
    }
    if (activeCount === 0) {
        $("#panel-toggler-0").prop("checked", true);
    }

    $("#panel-activation-buttons").buttonset("refresh");
    
    onPanelActivationChange();
}

function onPanelActivationChange() {
    var panels = [ $("#fragment-panel-0"), $("#fragment-panel-1"), $("#fragment-panel-2") ];
    var activeCount = 0;
    
    for (var i=0; i<3; ++i) {
        if ($("#panel-toggler-" + i).prop("checked")) {
            ++activeCount;
            panels[i].show();
            $("fragment-group-form\\:fragment-panel-toolbar-"+i).offset({
                left: panels[i].offset().left
            });
            sessionStorage.setItem('panel-' + i, 'on');
        }
        else {
            panels[i].hide();
            sessionStorage.setItem('panel-' + i, 'off');
        }
    }
    
    var w = '100%';
    switch (activeCount) {
    case 2:
        w = '49%';
        break;
    case 3: 
        w = '32%';
        break;
    }
    for (var i=0; i<3; ++i) {
        panels[i].css({ width: w });
    }
}

function makeSidebarToggleable() {
    var toggler = $("#sidebar-toggler");
    var sidebar = $("#sidebar");
    var content = $("#content");
    var defCntWt = content.css("width");
    toggler.off("click").on("click", function(e) {
        if (showOrHide(sidebar))
            content.css("width", defCntWt);
        else
            content.css("width", "100%");
    });
}

function showAboutDialog() {
    var dlg = PF("aboutDlg");
    dlg.show();
}

function createConfirmPasswordController() {
    var ctrr = new Object();
    var dlg, submit, action;
    
    function getDialog() {
        return dlg || (dlg = PF('confirmPwDlg'));
    }
    
    function getSubmit() {
        return submit || (submit = $("#user-menu-dlg-form\\:cpd-submit"));
    }
    
    ctrr.showDialog = function(ac) {
        if ($.isFunction(ac))
            action = ac;
        var d = getDialog();
        d.show();
    }
    
    ctrr.onTypePw = function(pwInput, e) {
        var btn = getSubmit();
        showOrHide(btn, $(pwInput).val());
    }
    
    ctrr.onComplete = function(xhr, status, args) {
        if (args.authenticated === true) {
            dlg.hide();
            if ($.isFunction(action))
                action();
        }
        else {
            $("#user-menu-dlg-form\\:cpd-pw").effect("shake").focus();
        }
    }
    
    return ctrr;
}

var CPC = createConfirmPasswordController();

function createDataBrokerController() {
    var ctrr = new Object();
    var dlg;
    var wzd;
    var nextBtn;
    
    function getDialog() {
        return dlg || (dlg = PF('dataBrokerDlg'));
    }

    function getWizard() {
        return wzd || (wzd = PF('dataBrokerWizard'));
    }
    
    function getNextStepButton() {
        return nextBtn || (nextBtn = getDialog().jq.find(".ui-wizard-nav-next"));
    }
    
    ctrr.showDialog = function() {
        var w = getWizard();
        w.loadStep(w.cfg.steps[0], false);
        
        var d = getDialog();
        d.show();

        getNextStepButton().hide();
    }
    
    ctrr.hideDialog = function() {
        getDialog().hide();
    }
    
    ctrr.onHide = function() {
        if (wzd.currentStep == "confirm-import-step") {
            location.replace('home');
        }
    }
    
    ctrr.setMode = function(exportMode) {
        $("#data-broker-export-mode").val(exportMode);
        if (exportMode)
            getDialog().jq.find(".ui-dialog-title").text(MSG.export_data);
        else
            getDialog().jq.find(".ui-dialog-title").text(MSG.import_data);
    }
    
    ctrr.onTypePw = function(pwInput, e) {
        var btn = getNextStepButton();
        if (e.which == $.ui.keyCode.ENTER) {
            btn.hide();
        }
        else
            showOrHide(btn, $(pwInput).val());
    }
    
    ctrr.onClickNext = function() {
        wzd.next();
        nextBtn.hide();
    }
    
    ctrr.onCompleteNext = function(xhr, status, args) {
        if (args.authFailed === true) {
            $("#user-menu-dlg-form\\:dbw-pw").effect("shake").focus();
        }
        else if (args.exportReady === true) {
            wzd.next(); // preexport-step => export-step
        }
    }
    
    ctrr.onFileUpload = function() {
        wzd.next(); // upload-step => import-step
    }
    
    ctrr.onDownloadExportData = function() {
        getNextStepButton().show();
    }
    
    return ctrr;
}

var DBC = createDataBrokerController();

function createUserProfileController() {
    var ctrr = new Object();
    var dlg, changePwCb, usrNmWgt, saveBtn, pwd1, pwd2;
    
    function getDialog() {
        return dlg || (dlg = PF('userProfileDlg'));
    }
    
    function getChangePasswordCheckbox() {
        return changePwCb || (changePwCb = getDialog().jq.find("input[name='enable_password_change']"));
    }
    
    function getUserNameWidget() {
        return usrNmWgt || (usrNmWgt = PF("userName"));
    }
    
    function getSaveBtn() {
        return saveBtn || (saveBtn = PF("userProfileDlgSave")); 
    }
    
    function getPasswordInput(i) {
        if (i == 1)
            return pwd1 || (pwd1 = $("#user-menu-dlg-form\\:pwd1"));
        else
            return pwd2 || (pwd2 = $("#user-menu-dlg-form\\:pwd2"));
    }

    function toggleUserProfileDlgSaveBtn() {
        var inplace = getUserNameWidget();
        var saveBtn = getSaveBtn();
        saveBtn.disable();
        var considerPw = getChangePasswordCheckbox().prop("checked");
        if (considerPw) {
            var pw1 = getPasswordInput(1).val();
            var pw2 = getPasswordInput(2).val();
            if (pw1 && pw2 && pw1 == pw2)
                saveBtn.enable();
        }
        else {
            if (inplace.jq.data("modified"))
                saveBtn.enable();
        }
    }
    
    ctrr.showDialog = function() {
        var d = getDialog();
        var cb = getChangePasswordCheckbox().prop("checked", false);
        this.togglePasswordChange(cb);
        
        var inplace = getUserNameWidget();
        function onInplaceCommit(val, text) {
            inplace.jq.data("modified", val !== text);
            toggleUserProfileDlgSaveBtn();
        }
        initPfInplaceWidget(
                inplace
                , inplace.jq.next("span").text()
                , d.jq.find("div.ui-panel").eq(0)
                , onInplaceCommit
        );    
        onInplaceCommit("", "");
        
        d.show();
    }

    ctrr.togglePasswordChange = function(checkbox)  {
        getPasswordInput(1).val(null);
        getPasswordInput(2).val(null);
        var checked = $(checkbox).prop("checked");
        showOrHide($("#new-password-box"), checked);
        toggleUserProfileDlgSaveBtn();
    }
    
    ctrr.onClickSaveUserProfile = function() {
        CPC.showDialog(function() {
            document.forms["user-menu-dlg-form"]["user-menu-dlg-form:update-user-profile-btn"].click()
        });
    }
    
    ctrr.onTypePassword = function(e) {
        if (e.which === $.ui.keyCode.ENTER) {
            e.preventDefault();
            return false;
        }
        toggleUserProfileDlgSaveBtn();        
    }
    
    ctrr.onTypeUsername = function(e) {
        getSaveBtn().disable();
    }
    
    return ctrr;
}

var UPC = createUserProfileController();

function setCurrentTheme(defaultTheme) {
    var theme = localStorage.getItem("theme");
    if (! theme) {
        theme = defaultTheme;
        localStorage.setItem("theme", theme);
    }
    PrimeFaces.changeTheme(theme);
}

function applyCurrentThemeToThemeSwitcher() {
    var theme = localStorage.getItem("theme");
    if (theme) {
        selectItemOnPfListbox(theme, PF('themeSwitcher'));
    }
}

function onChangeTheme() {
    var switcher = PF('themeSwitcher');
    var theme = switcher.getSelectedValue();
    if (theme) {
        localStorage.setItem("theme", theme);
    }
}

