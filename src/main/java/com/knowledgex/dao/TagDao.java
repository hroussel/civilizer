package com.knowledgex.dao;

import java.util.*;

import org.hibernate.Session;

import com.knowledgex.domain.*;

public interface TagDao {
    
    public List<?> executeQueryForResult(String query);
    
	public long countAll();
	
    public List<Tag> findAll();

    public List<Tag> findAllWithChildren(boolean includeSpecialTags);

    public void findIdsOfAllDescendants(Long parentTagId, Session s, Set<Long> idsInOut);

    public long countAllDescendants(Long id);

    public Tag findById(Long id);

    public Tag findById(Long id, boolean withFragments, boolean withChildren);

    public List<Tag> findParentTags(Long id);

    public Tag save(Tag tag);

    public void delete(Tag tag);
    
}
