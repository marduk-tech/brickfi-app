import { useMemo } from "react";
import MiniSearch from "minisearch";

interface UseMinisearchOptions {
  fields: string[];
  boost?: Record<string, number>;
  fuzzy?: number | boolean;
  prefix?: boolean;
  combineWith?: "AND" | "OR";
}

export const useMinisearch = <T extends Record<string, any>>(
  documents: T[],
  searchQuery: string,
  options: UseMinisearchOptions
) => {
  const { fields, boost, fuzzy = 0.2, prefix = true, combineWith = "OR" } = options;

  // Initialize and populate the search index
  const miniSearch = useMemo(() => {
    if (!documents || documents.length === 0) return null;

    // Create a unique ID field for each document
    const documentsWithId = documents.map((doc, index) => ({
      id: index,
      ...doc,
    }));

    const searchInstance = new MiniSearch({
      fields,
      storeFields: Object.keys(documents[0] || {}),
      searchOptions: {
        boost: boost || {},
        fuzzy,
        prefix,
        combineWith,
      },
    });

    searchInstance.addAll(documentsWithId);
    return searchInstance;
  }, [documents, fields, boost, fuzzy, prefix, combineWith]);

  // Perform the search
  const searchResults = useMemo(() => {
    if (!miniSearch) return documents;
    if (!searchQuery || searchQuery.trim() === "") return documents;

    try {
      const results = miniSearch.search(searchQuery.trim(), {
        boost: boost || {},
        fuzzy,
        prefix,
        combineWith,
      });

      // Map results back to original documents
      return results.map((result) => documents[result.id as number]);
    } catch (error) {
      console.error("Minisearch error:", error);
      return documents;
    }
  }, [miniSearch, searchQuery, documents, boost, fuzzy, prefix, combineWith]);

  return searchResults;
};
