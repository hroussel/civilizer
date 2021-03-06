package com.civilizer.web.view;

import java.io.File;
import java.io.Serializable;

import com.civilizer.utils.FsUtil;

@SuppressWarnings("serial")
public class FilePathBean implements Serializable {
	
	private String name = "";
	private String fullPath = "";
	private long fileEntityId = -1;
	private int id = -1;
	private boolean folder;
	private boolean broken;
	
	public FilePathBean(String fullPath) { 
		setFullPath(fullPath);
	}

	public FilePathBean(String name, String fullPath) { 
		setName(name);
		setFullPath(fullPath);
	}

	public FilePathBean(String name, String fullPath, long fileEntityId) {
	    setName(name);
	    setFullPath(fullPath);
	    setFileEntityId(fileEntityId);
	}
	
	public String getName() {
		return name;
	}

	public void setName(String name) {
	    if (name != null)
	        this.name = name.intern();
	}

	public int getId() {
		return id;
	}

	public void setId(int id) {
		this.id = id;
	}
	
	public boolean isBroken() {
		return broken;
	}

	public void setBroken(boolean broken) {
		this.broken = broken;
	}

	public String getFullPath() {
		return fullPath;
	}

	public void setFullPath(String fp) {
	    if (fp != null)
	        this.fullPath = FsUtil.normalizePath(fp).intern();
	}

	public long getFileEntityId() {
        return fileEntityId;
    }

    public void setFileEntityId(long fileEntityId) {
        this.fileEntityId = fileEntityId;
    }

    public boolean isFolder() {
		return folder;
	}
	
	public String getCssClassName() {
		String output = "";
		if (folder) {
			output += "fb-dir fa-folder-open ";
		}
		else {
			output += "fb-file fa-file-o ";
		}
		if (broken) {
			output += "fa-question-circle fb-broken ";
		}
		return output;
	}
	
	public String getHtmlId() {
	    String postfix = "";
	    if (fileEntityId == -1) { // this object represents a folder
	        postfix = "_" + id;
	    }
	    else { // this object represents a FileEntity
	        postfix = "-" + fileEntityId;
	    }
	    return "-cvz-file" + postfix;
	}

	public void check(String filesHomePath) {
		final File f = new File(FsUtil.concatPath(filesHomePath, fullPath));
		if (f.isDirectory()) {
			folder = true;
		}
		else if (f.isFile() == false) {
			broken = true;
		}
	}
	
	public File toFile(String filesHomePath) {
		return new File(FsUtil.concatPath(filesHomePath, fullPath));
	}
	
	@Override
	public boolean equals(Object obj) {
		if (this == obj)
            return true;
        if (obj == null)
            return false;
        if (getClass() != obj.getClass())
            return false;
        FilePathBean other = (FilePathBean) obj;
        return this.fullPath.equals(other.fullPath);
	}
	
	@Override
	public String toString() {
		return fullPath;
	}

}
