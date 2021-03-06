package com.civilizer.dao.hibernate;

import java.util.*;

import javax.annotation.Resource;

import org.hibernate.SessionFactory;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import com.civilizer.dao.FileEntityDao;
import com.civilizer.domain.FileEntity;

@Repository("fileEntityDao")
@Transactional
public class FileEntityDaoImpl implements FileEntityDao {
	
	private SessionFactory sessionFactory;
    
    @Resource(name = "sessionFactory")
    public void setSessionFactory(SessionFactory sessionFactory) {
        this.sessionFactory = sessionFactory;
    }

	@Override
	public long countAll() {
		return (Long) sessionFactory.getCurrentSession()
    			.getNamedQuery("FileEntity.countAll")
    			.iterate().next();
	}

	@SuppressWarnings("unchecked")
	@Override
	public List<FileEntity> findAll() {
		return sessionFactory.getCurrentSession()
                .createQuery("from FileEntity fe")
                .list();
	}

	@Override
	public FileEntity findById(Long id) {
		return (FileEntity) sessionFactory.getCurrentSession().get(FileEntity.class, id);
	}
	
	@Override
	public FileEntity findByName(String name) {
		return (FileEntity) sessionFactory.getCurrentSession()
                .getNamedQuery("FileEntity.findByName")
                .setParameter("name", name)
                .uniqueResult();
	}

	@SuppressWarnings("unchecked")
	@Override
	public List<FileEntity> findByNamePattern(String pattern) {
//		pattern += '%';
//		pattern = '%' + pattern + '%';
		return sessionFactory.getCurrentSession()
                .getNamedQuery("FileEntity.findByNamePattern")
                .setParameter("pattern", pattern)
                .list();
	}
	
	@Override
	public void save(FileEntity fe) {
		sessionFactory.getCurrentSession().saveOrUpdate(fe);
	}

	@Override
	public void delete(FileEntity fe) {
		sessionFactory.getCurrentSession().delete(fe);
	}

}
