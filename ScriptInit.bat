cd Client && npm install && cd ../API && composer update && php artisan migrate --seed && php artisan config:clear && php artisan config:cache && php artisan passport:install && PAUSE 
