# Use lightweight nginx to serve static files
FROM nginx:alpine

# Copy all frontend files to nginx's default serve directory
COPY . /usr/share/nginx/html

# Remove any server-side files that shouldn't be served
RUN rm -rf /usr/share/nginx/html/.github \
    /usr/share/nginx/html/.vscode \
    /usr/share/nginx/html/tests \
    /usr/share/nginx/html/weeklyupdates \
    /usr/share/nginx/html/Dockerfile

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]