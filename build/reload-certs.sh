#!/bin/sh
while true; do
    date > /tmp/reload-certs.txt

    echo "Refreshing SSL certificates"

    md5sumbefore=$(md5sum "/etc/nginx/my.ava.do.crt")
    curl "http://dappmanager.my.ava.do/my.ava.do.crt" --output /etc/nginx/my.ava.do.crt --silent
    curl "http://dappmanager.my.ava.do/my.ava.do.key" --output /etc/nginx/my.ava.do.key --silent
    md5sumafter=$(md5sum "/etc/nginx/my.ava.do.crt")

    if [ "$md5sumbefore" != "$md5sumafter" ]; then
        supervisorctl restart monitor
    else
        echo "No restart needed"
    fi

    #sleep one day
    sleep 86400
done
