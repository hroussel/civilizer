package com.civilizer.web.view;

import java.util.Locale;
import java.io.Serializable;

import javax.annotation.PostConstruct;
import javax.faces.bean.ManagedBean;
import javax.faces.bean.SessionScoped;
import javax.faces.context.FacesContext;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;

import com.civilizer.config.AppOptions;

@SuppressWarnings("serial")
@ManagedBean
@SessionScoped
public class UserProfileBean implements Serializable {
    
    private Locale locale;
    private String userName;
    private String password;

    @PostConstruct
    public void init() {
        locale = new Locale(System.getProperty(AppOptions.LOCALE));
        
        retrieveCurAuth();
    }
    
    public void retrieveCurAuth() {
        final Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        final Object principal = auth.getPrincipal();
        if (principal instanceof UserDetails) {
            final UserDetails ud = (UserDetails) principal;
            userName = ud.getUsername();
        }
    }

    public Locale getLocale() {
        return locale;
    }
    
    public void setLocale(Locale l) {
        locale = l;
        FacesContext.getCurrentInstance().getViewRoot().setLocale(locale);
    }

    public String getLanguage() {
        return locale.getLanguage();
    }
    
    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    @Override
    public String toString() {
        return locale.toString();
    }

}