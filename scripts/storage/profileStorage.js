// CONSTANTS
const USERS_KEY = "users";
const CURRENT_USER_KEY = "currentUser";
const AUTH_TYPE_KEY = "authType";
const TOKEN_KEY = "token";

const API_BASE = "https://localhost:7001/api/v1/User";

let exercises = [];

// SEED USERS
export async function seedUsers() {
    const existing = JSON.parse(localStorage.getItem(USERS_KEY));

    if (Array.isArray(existing) && existing.length > 0) {
        return;
    }

    try {
        const res = await fetch(new URL("../data/userProfiles.json", import.meta.url));
        const usersList = await res.json();

        localStorage.setItem(USERS_KEY, JSON.stringify(usersList));
    } catch (err) {
        console.error("Could not load userProfiles.json:", err);
        localStorage.setItem(USERS_KEY, JSON.stringify([]));
    }
}

// USER STORAGE HELPERS
function getUsers() {
    return JSON.parse(localStorage.getItem(USERS_KEY)) || [];
}

function saveUsers(users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function setCurrentUser(user) {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
}

function setAuthType(type) {
    localStorage.setItem(AUTH_TYPE_KEY, type);
}

function setToken(token) {
    localStorage.setItem(TOKEN_KEY, token);
}

export function getAuthType() {
    return localStorage.getItem(AUTH_TYPE_KEY);
}

export function getToken() {
    return localStorage.getItem(TOKEN_KEY);
}

export function logout() {
    localStorage.removeItem(CURRENT_USER_KEY);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(AUTH_TYPE_KEY);
}

export function getCurrentUser() {
    const raw = localStorage.getItem(CURRENT_USER_KEY);
    return raw ? JSON.parse(raw) : null;
}

function updateCurrentUser(updatedUser) {
    const authType = getAuthType();

    setCurrentUser(updatedUser);

    // Only local demo users are stored inside USERS_KEY
    if (authType !== "local") {
        return;
    }

    const users = getUsers();
    const index = users.findIndex(u => u.name === updatedUser.name);

    if (index !== -1) {
        users[index] = updatedUser;
        saveUsers(users);
    }
}

// AUTHENTICATION

export function registerUser(name, password, email) {
    const users = getUsers();

    if (users.find(u => u.name.toLowerCase() === name.toLowerCase())) {
        throw new Error("Name is already taken.");
    }

    const newUser = {
        name,
        email,
        password,
        profile: getDefaultProfile()
    };

    users.push(newUser);
    saveUsers(users);

    setAuthType("local");
    setCurrentUser(newUser);

    return newUser;
}

async function loginWithApi(name, password) {
    const res = await fetch(`${API_BASE}/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            userName: name,
            password
        })
    });

    let data;

    try {
        data = await res.json();
    } catch {
        data = null;
    }

    if (!res.ok) {
        throw new Error(data?.message || "Wrong username or password.");
    }

    setAuthType("api");
    setToken(data.token);
    setCurrentUser(data);

    return data;
}

function loginWithLocalUser(name, password) {
    const users = getUsers();

    const user = users.find(u =>
        u.name.toLowerCase() === name.toLowerCase() &&
        u.password === password
    );

    if (!user) {
        return null;
    }

    setAuthType("local");
    localStorage.removeItem(TOKEN_KEY);
    setCurrentUser(user);

    return user;
}

export async function login(name, password) {
    // 1. First try old local demo users
    const localUser = loginWithLocalUser(name, password);

    if (localUser) {
        return localUser;
    }

    // 2. If not found locally, try backend API login
    return await loginWithApi(name, password);
}

// PROFILE
function getDefaultProfile() {
    return {
        name: "",
        age: "",
        gender: "",
        weight: "",
        height: "",
        experience: "",

        trainingGoals: [],
        sessions: [],

        progress: {
            weightHistory: [],
            strengthHistory: [],
            cardioHistory: []
        },

        achievements: [],
        schedule: [],

        statistics: {
            totalSessions: 0,
            totalMinutes: 0,
            mostTrainedMuscleGroup: "Unknown",
            averageSessionsPerWeek: 0
        },

        personalNotes: []
    };
}

export function getProfile() {
    const user = getCurrentUser();
    const authType = getAuthType();

    if (!user) return null;

    // Only local demo users have old frontend profile data
    if (authType !== "local") {
        return null;
    }

    return user.profile;
}

export function saveProfile(profile) {
    const user = getCurrentUser();
    const authType = getAuthType();

    if (!user || authType !== "local") return;

    user.profile = profile;
    updateCurrentUser(user);
}

export function updateProfile(data) {
    const profile = getProfile();

    if (!profile) return null;

    const updated = { ...profile, ...data };
    saveProfile(updated);

    return updated;
}

export function isProfileEmpty(profile) {
    if (!profile) return false;

    const empty = getDefaultProfile();
    return JSON.stringify(profile) === JSON.stringify(empty);
}

// EXERCISES
export async function loadExercises() {
    if (exercises.length) return exercises;

    try {
        const res = await fetch(new URL("../data/exercises.json", import.meta.url));
        exercises = await res.json();
        return exercises;
    } catch (err) {
        console.error("Could not load exercises.json:", err);
        return [];
    }
}

// ADD PROGRESS
export function addWeightProgress(weight) {
    const profile = getProfile();

    if (!profile) return;

    profile.progress.weightHistory.push({
        date: new Date().toISOString(),
        weight
    });

    saveProfile(profile);
}

export function addStrengthProgress(exercise, value) {
    const profile = getProfile();

    if (!profile) return;

    profile.progress.strengthHistory.push({
        date: new Date().toISOString(),
        exercise,
        value
    });

    saveProfile(profile);
}

export function addCardioProgress(distance, time) {
    const profile = getProfile();

    if (!profile) return;

    profile.progress.cardioHistory.push({
        date: new Date().toISOString(),
        distance,
        time
    });

    saveProfile(profile);
}

// ADD FUNCTIONS
export function addAchievement(text) {
    const profile = getProfile();

    if (!profile) return;

    profile.achievements.push(text);
    saveProfile(profile);
}

export function addTrainingSchedule(date, type, notes = "") {
    const profile = getProfile();

    if (!profile) return;

    profile.schedule.push({ date, type, notes });
    saveProfile(profile);
}

export function addPersonalNote(text) {
    const profile = getProfile();

    if (!profile) return;

    profile.personalNotes.push({
        date: new Date().toISOString(),
        text
    });

    saveProfile(profile);
}

export function addTrainingGoal(title, target, deadline) {
    const profile = getProfile();

    if (!profile) return;

    profile.trainingGoals.push({
        title,
        target,
        deadline,
        progress: 0
    });

    saveProfile(profile);
}

// DELETE FUNCTIONS
export function deleteTrainingGoal(index) {
    const profile = getProfile();

    if (!profile) return;

    profile.trainingGoals.splice(index, 1);
    saveProfile(profile);
}

export function deleteTrainingSchedule(index) {
    const profile = getProfile();

    if (!profile) return;

    profile.schedule.splice(index, 1);
    saveProfile(profile);
}

export function deleteAchievement(index) {
    const profile = getProfile();

    if (!profile) return;

    profile.achievements.splice(index, 1);
    saveProfile(profile);
}

export function deletePersonalNote(index) {
    const profile = getProfile();

    if (!profile) return;

    profile.personalNotes.splice(index, 1);
    saveProfile(profile);
}

export function deleteWeightProgress(index) {
    const profile = getProfile();

    if (!profile) return;

    profile.progress.weightHistory.splice(index, 1);
    saveProfile(profile);
}

export function deleteStrengthProgress(index) {
    const profile = getProfile();

    if (!profile) return;

    profile.progress.strengthHistory.splice(index, 1);
    saveProfile(profile);
}

export function deleteCardioProgress(index) {
    const profile = getProfile();

    if (!profile) return;

    profile.progress.cardioHistory.splice(index, 1);
    saveProfile(profile);
}

// STATISTICS
async function calculateMostTrainedMuscleGroup(sessions) {
    await loadExercises();

    if (!sessions.length || !exercises.length) return "Unknown";

    const counter = {};

    sessions.forEach(session => {
        if (!session.exercises) return;

        session.exercises.forEach(item => {
            const exercise = exercises.find(e => e.id === item.exerciseId);

            if (!exercise || !exercise.muscleGroup) return;

            counter[exercise.muscleGroup] =
                (counter[exercise.muscleGroup] || 0) + 1;
        });
    });

    let top = "Unknown";
    let max = 0;

    for (const group in counter) {
        if (counter[group] > max) {
            max = counter[group];
            top = group;
        }
    }

    return top;
}

export async function updateStatistics() {
    const profile = getProfile();

    if (!profile) return null;

    const sessions = profile.sessions || [];

    profile.statistics.totalSessions = sessions.length;

    profile.statistics.totalMinutes = sessions.reduce(
        (sum, s) => sum + (s.duration || 0),
        0
    );

    profile.statistics.mostTrainedMuscleGroup =
        await calculateMostTrainedMuscleGroup(sessions);

    const weeks = Math.max(1, Math.ceil(sessions.length / 7));

    profile.statistics.averageSessionsPerWeek =
        sessions.length / weeks;

    saveProfile(profile);

    return profile.statistics;
}