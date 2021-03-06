//@formatter:off
@NamedQueries({
    @NamedQuery(name = "Fragment.countAll",
        query = "select count(*) "
        	  + "from Fragment f"
              ),
    @NamedQuery(name = "Fragment.countAllNonTrashed",
        query = "select count(*) "
              + "from Fragment f "
              + "where f.id not in ( "
              + "  select t2f.fragmentId "
              + "  from Tag2Fragment t2f "
              + "  where t2f.tagId = 0 "
              + ") "
              ),
    @NamedQuery(name = "Fragment.countByTagId",
        query = "select count(f) "
              + "from Fragment f "
              + "  inner join f.tags t "
              + "where t.id = :tagId "
              ),
    @NamedQuery(name = "Fragment.countByTagIds",
        query = "select count(distinct f) "
              + "from Fragment f "
              + "  inner join f.tags t "
              + "where t.id in (:tagIds) "
              ),
    @NamedQuery(name = "Fragment.countNonTrashedByTagId",
        query = "select count(f) "
              + "from Fragment f "
              + "  inner join f.tags t "
              + "where t.id = :tagId and f.id not in ( "
              + "  select t2f.fragmentId "
              + "  from Tag2Fragment t2f "
              + "  where t2f.tagId = 0 "
              + ") "
              ),
    @NamedQuery(name = "Fragment.countNonTrashedByTagIds",
        query = "select count(distinct f) "
              + "from Fragment f "
              + "  inner join f.tags t "
              + "where t.id in (:tagIds) and f.id not in ( "
              + "  select t2f.fragmentId "
              + "  from Tag2Fragment t2f "
              + "  where t2f.tagId = 0 "
              + ") "
              ),
    @NamedQuery(name = "Fragment.findByTagId",
        query = "select distinct f "
              + "from Fragment f "
              + "  inner join f.tags t "
              + "where t.id = :tagId "
              ),
    @NamedQuery(name = "Fragment.findByTagIds",
        query = "select distinct f "
              + "from Fragment f "
              + "  inner join f.tags t "
              + "  left join fetch f.tags "
              + "where t.id in (:tagIds) "
              ),
    @NamedQuery(name = "Fragment.findNonTrashedByTagId",
        query = "select distinct f "
              + "from Fragment f "
              + "  inner join f.tags t "
              + "where t.id = :tagId and f.id not in ( "
              + "  select t2f.fragmentId "
              + "  from Tag2Fragment t2f "
              + "  where t2f.tagId = 0 "
              + ") "
              ),
    @NamedQuery(name = "Fragment.findByIdWithAll",
        query = "select distinct f "
              + "from Fragment f "
              + "  left join fetch f.tags "
              + "  left join fetch f.relatedOnes "
              + "where f.id = :id "
              ),
    @NamedQuery(name = "Fragment.findIdsByTagId",
        query = "select f.id "
              + "from Fragment f "
              + "  inner join f.tags t "
              + "where t.id = :tagId "
              ),
              
    @NamedQuery(name = "Fragment.findIdsNonTrashedOrderByUpdateDatetime",
        query = "select f.id "
              + "from Fragment f "
              + "where f.id not in ( "
              + "  select t2f.fragmentId "
              + "  from Tag2Fragment t2f "
              + "  where t2f.tagId = 0 "
              + ") "
              + "order by f.updateDatetime desc "
              ),
    @NamedQuery(name = "Fragment.findIdsNonTrashedOrderByCreationDatetime",
        query = "select f.id "
              + "from Fragment f "
              + "where f.id not in ( "
              + "  select t2f.fragmentId "
              + "  from Tag2Fragment t2f "
              + "  where t2f.tagId = 0 "
              + ") "
              + "order by f.creationDatetime desc "
              ),
    @NamedQuery(name = "Fragment.findIdsNonTrashedOrderByTitle",
        query = "select f.id "
              + "from Fragment f "
              + "where f.id not in ( "
              + "  select t2f.fragmentId "
              + "  from Tag2Fragment t2f "
              + "  where t2f.tagId = 0 "
              + ") "
              + "order by lower(f.title) desc "
              ),
    @NamedQuery(name = "Fragment.findIdsNonTrashedOrderById",
        query = "select f.id "
              + "from Fragment f "
              + "where f.id not in ( "
              + "  select t2f.fragmentId "
              + "  from Tag2Fragment t2f "
              + "  where t2f.tagId = 0 "
              + ") "
              + "order by f.id desc "
              ),
              
    @NamedQuery(name = "Fragment.findIdsNonTrashedByTagIdOrderByUpdateDatetime",
        query = "select f.id "
              + "from Fragment f "
              + "  inner join f.tags t "
              + "where t.id in (:tagIds) and f.id not in ( "
              + "  select t2f.fragmentId "
              + "  from Tag2Fragment t2f "
              + "  where t2f.tagId = 0 "
              + ") "
              + "order by f.updateDatetime desc "
              ),
    @NamedQuery(name = "Fragment.findIdsNonTrashedByTagIdOrderByCreationDatetime",
        query = "select f.id "
              + "from Fragment f "
              + "  inner join f.tags t "
              + "where t.id in (:tagIds)  and f.id not in ( "
              + "  select t2f.fragmentId "
              + "  from Tag2Fragment t2f "
              + "  where t2f.tagId = 0 "
              + ") "
              + "order by f.creationDatetime desc "
              ),
    @NamedQuery(name = "Fragment.findIdsNonTrashedByTagIdOrderByTitle",
        query = "select f.id "
              + "from Fragment f "
              + "  inner join f.tags t "
              + "where t.id in (:tagIds)  and f.id not in ( "
              + "  select t2f.fragmentId "
              + "  from Tag2Fragment t2f "
              + "  where t2f.tagId = 0 "
              + ") "
              + "order by lower(f.title) desc "
              ),
    @NamedQuery(name = "Fragment.findIdsNonTrashedByTagIdOrderById",
        query = "select f.id "
              + "from Fragment f "
              + "  inner join f.tags t "
              + "where t.id in (:tagIds)  and f.id not in ( "
              + "  select t2f.fragmentId "
              + "  from Tag2Fragment t2f "
              + "  where t2f.tagId = 0 "
              + ") "
              + "order by f.id desc "
              ),
              
    @NamedQuery(name = "Fragment.findIdsByTagIdOrderByUpdateDatetime",
        query = "select f.id "
              + "from Fragment f "
              + "  inner join f.tags t "
              + "where t.id = :tagId "
              + "order by f.updateDatetime desc "
              ),
    @NamedQuery(name = "Fragment.findIdsByTagIdOrderByCreationDatetime",
        query = "select f.id "
              + "from Fragment f "
              + "  inner join f.tags t "
              + "where t.id = :tagId "
              + "order by f.creationDatetime desc "
              ),
    @NamedQuery(name = "Fragment.findIdsByTagIdOrderByTitle",
        query = "select f.id "
              + "from Fragment f "
              + "  inner join f.tags t "
              + "where t.id = :tagId "
              + "order by lower(f.title) desc "
              ),
    @NamedQuery(name = "Fragment.findIdsByTagIdOrderById",
        query = "select f.id "
              + "from Fragment f "
              + "  inner join f.tags t "
              + "where t.id = :tagId "
              + "order by f.id desc "
              ),
    
    //----------------------------------------------------------//
              
    @NamedQuery(name = "Tag.countAll",
        query = "select count(*) "
        	  + "from Tag t"
              ),
    @NamedQuery(name = "Tag.findIdsOrderByTagName",
		query = "select t.id "
		      + "from Tag t "
		      + "order by lower(t.tagName) asc "
		      ),
    @NamedQuery(name = "Tag.findIdsNonSpecialOrderByTagName",
		query = "select t.id "
		      + "from Tag t "
		      + "where t.id > 0 "
		      + "order by lower(t.tagName) asc "
		      ),
    @NamedQuery(name = "Tag.findIdsOfChildren",
		query = "select c.id "
		      + "from Tag t "
              + "  inner join t.children c "
              + "where t.id = :id"
		      ),
    @NamedQuery(name = "Tag.findByIdWithChildren",
        query = "select distinct t "
              + "from Tag t "
              + "  left join fetch t.children "
              + "where t.id = :id "
              ),
    @NamedQuery(name = "Tag.findFragmentsWithIdFilter",
        query = "select distinct f "
              + "from Tag t "
              + "  inner join t.fragments as f "
              + "  left join fetch f.tags "
              + "where t.id in (:ids) "
              ),
    @NamedQuery(name = "Tag.findParentTags",
        query = "select distinct t "
              + "from Tag t "
              + "  inner join t.children child "
              + "where child.id = :id "
              ),

    //----------------------------------------------------------//              
              
    @NamedQuery(name = "Tag2Fragment.findTrashedFragmentIds",
        query = "select t2f.fragmentId "
              + "from Tag2Fragment t2f "
              + "where t2f.tagId = 0 "
              ),
    
    //----------------------------------------------------------//              
    

    @NamedQuery(name = "FileEntity.countAll",
        query = "select count(*) "
        	  + "from FileEntity f"
              ),

    @NamedQuery(name = "FileEntity.findByName",
        query = "select distinct fe "
              + "from FileEntity fe "
              + "where fe.fileName = :name"
              ),

    @NamedQuery(name = "FileEntity.findByNamePattern",
        query = "select fe "
              + "from FileEntity fe "
              + "where fe.fileName like :pattern"
              ),
}) 

package com.civilizer.domain;

import org.hibernate.annotations.NamedQueries;
import org.hibernate.annotations.NamedQuery;

