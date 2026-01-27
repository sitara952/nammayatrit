export const mentionRegex = /\B@\S+/g;
export const mentionRegexTester = /^\B@\S+$/g;
export const hashtagRegex = /#\S+|\S+#(?!\S)/gm;
export const hashtagRegexTester = /^#\S+|\S+#(?!\S)$/gm;
export const emailRegex = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/gi;
export const emailRegexTester = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/gi;
export const urlRegex = /https?:\/\/\S+|[-a-zA-Z0-9@:%._~#=]+\.[a-zA-Z0-9()]{2,6}\S*/gi;
export const urlRegexTester = /^https?:\/\/\S+|[-a-zA-Z0-9@:%._~#=]+\.[a-zA-Z0-9()]{2,6}\S*$/gi;
