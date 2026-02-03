/* search and filter items function */

export function filterExercises(exercises, searchTerm, category){
    return exercises.filter(exercise => {
        const matchesSearch = exercise.name.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesCategory = 
            category === 'all' || exercise.category === category;
            
            return matchesSearch && matchesCategory;
    });
}