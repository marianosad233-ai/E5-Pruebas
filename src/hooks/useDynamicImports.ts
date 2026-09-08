/**
 * Custom hook to handle dynamic imports of Pokemon data files
 */
export const useDynamicImports = () => {
  /**
   * Gets Pokemon files for a specific region and leader
   * @param regionId - The ID of the region
   * @param leaderId - The ID of the leader
   * @returns Array of file names
   */
  const getPokemonFiles = async (regionId: string, leaderId: string): Promise<string[]> => {
    try {
      // In Vite, we need to use import.meta.glob instead of require.context
      const modules = import.meta.glob('../data/**/*.json', { eager: true });
      
      // Filter the modules to get only the ones for the specified region/leader
      const pattern = `../data/${regionId}/${leaderId}/`;
      const files = Object.keys(modules)
        .filter(key => key.includes(pattern))
        .map(key => key.split('/').pop() || '');
      
      return files;
    } catch (error) {
      console.error(`Error getting files for ${regionId}/${leaderId}:`, error);
      return [];
    }
  };

  return { getPokemonFiles };
};
