if [ -z "$1" ]; then
    target="Discord-SimpleTTS"
else
    target="$1"
fi

echo will be start $target ....
screen -T xterm-256color -dmS $target sh run.sh
