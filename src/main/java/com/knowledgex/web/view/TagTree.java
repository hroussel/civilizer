package com.knowledgex.web.view;

import java.io.Serializable;
import java.util.*;

import org.primefaces.model.TreeNode;
import org.primefaces.model.DefaultTreeNode;

import com.knowledgex.domain.Tag;

@SuppressWarnings("serial")
public final class TagTree implements Serializable {
    
    private TreeNode root = null;
    
    public TagTree() {
    }

    public void populateNodes(Collection<Tag> tags) {
        root = new DefaultTreeNode("Root", null);
        
        // These tags have no parent
        Collection<Tag> topParentTags = Tag.getTopParentTags(tags);
        
        Map<Long, TreeNode> mapTagId2TreeNode = new HashMap<Long, TreeNode>();
        
        for (Tag t : topParentTags) {
            mapTagId2TreeNode.put(t.getId(), new DefaultTreeNode(t, root));
        }
        
        for (Tag t : tags) {
            Collection<Tag> children = t.getChildren();
            for (Tag c : children) {
                TreeNode parentTreeNode = mapTagId2TreeNode.get(t.getId());
                mapTagId2TreeNode.put(c.getId(), new DefaultTreeNode(c, parentTreeNode));
                parentTreeNode.setExpanded(true);
            }
        }
    }

    public void populateNodes(List<Tag> tags, List<TagBean> tagBeans) {
    	root = new DefaultTreeNode("Root", null);
    	
    	// These tags have no parent
    	Collection<Tag> topParentTags = Tag.getTopParentTags(tags);
    	
    	Map<Long, TreeNode> mapTagId2TreeNode = new HashMap<Long, TreeNode>();
    	
    	for (Tag t : topParentTags) {
    		final int index = Tag.getIndexOf(t.getId(), tags);
    		mapTagId2TreeNode.put(t.getId(), new DefaultTreeNode(tagBeans.get(index), root));
    	}
    	
    	for (Tag t : tags) {
    		Collection<Tag> children = t.getChildren();
    		for (Tag c : children) {
    			TreeNode parentTreeNode = mapTagId2TreeNode.get(t.getId());
    			final int index = Tag.getIndexOf(c.getId(), tags);
    			mapTagId2TreeNode.put(c.getId(), new DefaultTreeNode(tagBeans.get(index), parentTreeNode));
    			parentTreeNode.setExpanded(true);
    		}
    	}
    }

    public TreeNode getRoot() {
        return root;
    }

}
