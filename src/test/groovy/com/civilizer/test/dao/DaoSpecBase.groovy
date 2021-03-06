package com.civilizer.test.dao

import spock.lang.*;

import javax.sql.DataSource;

import org.hibernate.Session;
import org.hibernate.SessionFactory;
import org.springframework.context.support.GenericXmlApplicationContext;
import org.springframework.core.io.ClassPathResource;
import org.springframework.jdbc.datasource.init.DatabasePopulatorUtils;
import org.springframework.jdbc.datasource.init.ResourceDatabasePopulator
import org.springframework.orm.hibernate4.HibernateTransactionManager;
import org.springframework.transaction.TransactionStatus;
import org.springframework.transaction.TransactionDefinition;
import org.springframework.transaction.support.DefaultTransactionDefinition;

import com.civilizer.dao.*;
import com.civilizer.domain.*;
import com.civilizer.test.helper.TestUtil;

@Ignore
class DaoSpecBase extends spock.lang.Specification {
    
    static GenericXmlApplicationContext ctx;

    SessionFactory sessionFactory;
    HibernateTransactionManager txManager;
    TransactionStatus txStatus;
    Session session;
    
    FragmentDao fragmentDao;
    TagDao tagDao;
    FileEntityDao fileEntityDao;
    
    def temporalTags = new ArrayList<Tag>();
    def temporalFragments = new ArrayList<Fragment>();
    
    static def setupApplicationContext(String dataSourceContextPath) {
        TestUtil.newLogger();
        ctx = new GenericXmlApplicationContext();
        ctx.load(dataSourceContextPath);
        ctx.refresh();
    }
    
    static def cleanupApplicationContext() {
        ctx.close();
    }

    static void runSqlScript(String ... scripts) {
        DataSource dataSource = ctx.getBean("dataSource", DataSource.class);
        assert dataSource
        ResourceDatabasePopulator populator = new ResourceDatabasePopulator();
        scripts.each {
            def script = new ClassPathResource(it);
            assert script
            populator.addScript(script);
        }
        DatabasePopulatorUtils.execute(populator, dataSource);
    }
    
    static void buildCreateDataSet() throws Exception {
        try {
            TestUtil.configure();
            DaoSpecBase.setupApplicationContext(
                "classpath:datasource-context-h2-url.xml");
            FileEntityDao fileEntityDao = ctx.getBean("fileEntityDao",
                    FileEntityDao.class);
            assert fileEntityDao;

            TestUtil.touchTestFilesForFileBox(fileEntityDao);
        } finally {
            DaoSpecBase.cleanupApplicationContext();
            TestUtil.unconfigure();
        }
    }

    def beginTransaction() {
        assert ctx
        sessionFactory = ctx.getBean("sessionFactory", SessionFactory.class);
        assert sessionFactory
        txManager = ctx.getBean("transactionManager", HibernateTransactionManager.class);
        assert txManager

        DefaultTransactionDefinition txd = new DefaultTransactionDefinition();
        txd.setName("TxForUnitTest");
        txd.setPropagationBehavior(TransactionDefinition.PROPAGATION_REQUIRED);

        txStatus = txManager.getTransaction(txd);
        assert txStatus

        session = sessionFactory.getCurrentSession();
        assert session
    }

    def endTransaction(def rollback) {
        assert txManager && txStatus
        if (rollback)
            txManager.rollback(txStatus);
        else
            txManager.commit(txStatus);
    }

    void deleteAllTemporalObjects() {
        temporalTags.each {
            if (tagDao.findById(it.getId()))
                tagDao.delete(it);
        }
        temporalFragments.each {
            if (fragmentDao.findById(it.getId()))
                fragmentDao.delete(it);
        }
    }

    Tag newTag(String name) {
        if (name == null) {
            name = "new tag " + temporalTags.size();
        }
        else {
            name = name.trim();
        }
        Tag result = new Tag(name);
        assert result;
        temporalTags.add(result);
        result;
    }
    
    Fragment newFragment() {
        Fragment frg = new Fragment(
            "new fragment " + temporalFragments.size(),
            "Some content...", null);
        assert frg;
        temporalFragments.add(frg);
        frg;
        
    }
    
    Fragment newFragment(String title, String content) {
        Fragment frg = new Fragment(title, content, null);
        assert frg;
        temporalFragments.add(frg);
        frg;
    }
    
    Long getAndValidateId(Fragment f) {
        def id = f.getId();
        assert id != null && id >= 0;
        id;
    }

    Long getAndValidateId(Tag f) {
        def id = f.getId();
        assert id != null;
        id;
    }
    
    void findAllAncestorsOfTag(Tag tag, Set<Tag> idsInOut) {
        final List<Tag> parents = tagDao.findParentTags(tag.getId());
        idsInOut.addAll(parents);
        for (Tag t : parents) {
            findAllAncestorsOfTag(t, idsInOut);
        }
    }
    
    void doSetup() {
        TestUtil.configure();
        
        fragmentDao = ctx.getBean("fragmentDao", FragmentDao.class);
        assert fragmentDao;
        tagDao = ctx.getBean("tagDao", TagDao.class);
        assert tagDao;
        fileEntityDao = ctx.getBean("fileEntityDao", FileEntityDao.class);
        assert fileEntityDao;
        
        // Make sure all test files exist on the file system
        TestUtil.touchTestFilesForFileBox(fileEntityDao);
    }
    
    void doCleanup() {
        deleteAllTemporalObjects();
        TestUtil.unconfigure();
    }
    
    def setup() {
        doSetup();
    }

    def cleanup() {
        doCleanup();
    }
    
}
