package com.civilizer.dao.hibernate;

import java.util.List;

import org.hibernate.Criteria;
import org.hibernate.Session;
import org.hibernate.criterion.Junction;
import org.hibernate.criterion.Restrictions;

import com.civilizer.domain.Fragment;
import com.civilizer.domain.SearchParams;
import com.civilizer.domain.SearchParams.Keyword;
import com.civilizer.utils.Pair;

public final class SearchQueryCreator {
	
    public static Pair<String, Character> getPatternFromKeyword(SearchParams.Keyword keyword) {
        // Escape ' (single quote) with '' if any.
        String word = keyword.getWord().replace("'", "''");
        char escapeChar = 0;
        
        if (keyword.isTrivial()) {
            final Pair<String, Character> tmp =
                    SearchParams.Keyword.escapeSqlWildcardCharacters(word);
            word = "%" + tmp.getFirst() + "%";
            escapeChar = tmp.getSecond();
        }
        
        return new Pair<String, Character>(word, escapeChar);
    }
    
    private static Junction buildQueryWithKeywords(List<Keyword> words, int target, boolean any) {
    	final String[] targetColumns = {
    	        null, "TAG_NAME", "TITLE", "CONTENT", "this_.FRAGMENT_ID"
    	};
    	
    	final String column = targetColumns[target];
    	if (column == null) {
    		throw new IllegalArgumentException();
    	}
    	
    	final Junction junction = any ?
    			Restrictions.disjunction() : Restrictions.conjunction();
    			
		for (SearchParams.Keyword w : words) {
		    final Pair<String, Character> tmp = getPatternFromKeyword(w);
			final String pattern = tmp.getFirst();
			final char escapeChar = tmp.getSecond();
			String sql = null;
			
			if (w.isTrivial()) {
				if (w.isCaseSensitive()) {
                    sql = column + " like " + "'" + pattern + "'";
                }
                else {
                    sql = "lower(" + column + ") like " + "'" + pattern.toLowerCase() + "'";
                }
				if (escapeChar != 0) {
				    sql += " escape '" + escapeChar + "'";
				}
            }
			else {
				if (w.isId()) {
					sql = column + " = " + pattern;
				}
				else if (w.isRegex()) {
					sql = column + " regexp " + "'" + pattern + "'";
				}
				else if (w.isWholeWord()) {
			        if (w.isCaseSensitive()) {
			            sql = column + " regexp " + "'\\b" + pattern + "\\b'";
			        }
			        else {
			            sql = "lower(" + column + ") regexp " + "'\\b" + pattern.toLowerCase() + "\\b'";
			        }
			    }
				else if (w.isBeginningWith()) {
					if (w.isCaseSensitive()) {
						sql = column + " regexp " + "'\\b" + pattern + "'";
					}
					else {
						sql = "lower(" + column + ") regexp " + "'\\b" + pattern.toLowerCase() + "'";
					}
				}
				else if (w.isEndingWith()) {
					if (w.isCaseSensitive()) {
						sql = column + " regexp " + "'" + pattern + "\\b'";
					}
					else {
						sql = "lower(" + column + ") regexp " + "'" + pattern.toLowerCase() + "\\b'";
					}
				}
			    else {
			        throw new UnsupportedOperationException();
			    }
			}
			
			if (w.isInverse()) {
				sql = "not " + sql;
			}
			
			// [TODO] research compatibility issues with other DBMS vendors
			junction.add(Restrictions.sqlRestriction(sql));
		}
		
		return junction;
    }
    
    public static Criteria buildQuery(SearchParams params, Session session) {
    	final Criteria output = session.createCriteria(Fragment.class);
//    	Criteria tagCrit = output.createCriteria("tags");
    	output.setResultTransformer(Criteria.DISTINCT_ROOT_ENTITY);
    	
    	Junction rootJunction = Restrictions.conjunction();
    	
    	for (SearchParams.Keywords keywords : params.getKeywords()) {
    		final int target = keywords.getTarget();
    		final List<Keyword> words = keywords.getWords();
    		final boolean any = keywords.isAny();
    		
    		if (target == SearchParams.TARGET_DEFAULT) {
				Junction disj = Restrictions.disjunction();
				
				Junction junc = buildQueryWithKeywords(words, SearchParams.TARGET_TITLE, any);
				disj.add(junc);
				
				junc = buildQueryWithKeywords(words, SearchParams.TARGET_TEXT, any);
				disj.add(junc);
				
				rootJunction.add(disj);
			}
//			else if (target == SearchParams.TARGET_TAG) {
//				Junction junc = buildQueryWithKeywords(words, target, true);
//				tagCrit.add(junc);
//			}
			else if (target != SearchParams.TARGET_TAG) {
				Junction junc = buildQueryWithKeywords(words, target, any);
				rootJunction.add(junc);
			}
		}
    	
    	output.add(rootJunction);
        return output;
    }

}
