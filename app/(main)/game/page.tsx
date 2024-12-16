"use client";
import React, {useEffect, useState, useRef} from "react";
import Link from "next/link";
import { initializeApp, FirebaseOptions } from "firebase/app";
import { getDatabase, ref, set, onValue } from "firebase/database";
import { useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogFooter,  DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { XIcon, RotateCwIcon } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

const defaultBoxes = {"chance": "player1", "eighth": "", "fifth": "", "first": "", "fourth": "", "ninth": "", "second": "", "seventh": "", "sixth": "", "third": "", "winner": ""};

const allBoxes = ["first", "second", "third", "fourth", "fifth", "sixth", "seventh", "eighth", "ninth"];

interface BoxObject { [key: string]: string };

const winningPatterns = [
    ["first", "second", "third"],
    ["fourth", "fifth", "sixth"],
    ["seventh", "eighth", "ninth"],
    ["first", "fourth", "seventh"],
    ["second", "fifth", "eighth"],
    ["third", "sixth", "ninth"],
    ["first", "fifth", "ninth"],
    ["third", "fifth", "seventh"],
];

export default function Game() {

    const db = getDatabase();
    const search = useSearchParams();
    
    const userId = localStorage.getItem("userId") || "";
    const title = (localStorage.getItem("title") ? localStorage.getItem("title") : "Tic Tac Toe") || null;

    const random = () => Math.random().toString().slice(2, 8);

    const toastIds = { gameStart: random(), p1Join: random(), p2Join: random(), gameReset: random(), gameFinished: random() };
    const [boxes, setBoxes] = useState<BoxObject>(defaultBoxes);
    const [gameStart, setGameStart] = useState(false);
    const [gameFinished, setGameFinished] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [uType, setUtype] = useState('watcher');
    const [name, setName] = useState(userId);
    const [host, setHost] = useState("");
    const [player1, setPlayer1] = useState("");
    const [player2, setPlayer2] = useState("");

    const fullURL = 'games/' + search?.get("id");

    const playerCountRef = ref(db, fullURL);
    const boxesRef = ref(db, 'games/' + search?.get("id") + '/boxes');

    useEffect(() => {
        onValue(playerCountRef, (snapshot) => {
            const data = snapshot.val();
            if(data) {
                console.log("New Data", data, data.player1, data.player2)
                if(data.hasOwnProperty("player1") && data.hasOwnProperty("player1") && gameStart === false) {
                    setGameStart(true);
                    toast({ id: toastIds.gameStart, title: "Game", description: "has started" });
                }
                if(host == "" && data.host) {
                    setHost(data.host);
                }
                if(player1 !== data.player1) {
                    setPlayer1(data.player1);
                    toast({ id: toastIds.p1Join, title: data.player1, description: `joined as Player 1.` });
                }
                console.log(player1, " : ",data.player1, " | ", player2, " : ", data.player2, player2 != data.player2);
                if(player2 !== data.player2) {
                    setPlayer2(data.player2);
                    toast({ id: toastIds.p2Join, title: data.player2, description: `joined as Player 2.` });
                }
                if(data.player1) {
                    if(data.player1 !== userId) {
                        if(data.player2) {
                            if(data.player2 !== userId) {
                                console.log("Room Occupied, added as a Watcher");
                            }
                            else {
                                if(uType == 'watcher') { setUtype('player2') }
                            }
                        }
                        else {
                            set(ref(db, fullURL), {...data, player2: userId });
                        }
                    }
                    else {
                        if(uType == 'watcher') { setUtype('player1') }
                    }
                }
                else {
                    set(ref(db, fullURL), {...data, player1: userId, host: userId });
                }
            }
            else {
                set(ref(db, fullURL), {...data, name: title, boxes: boxes });
            }
            
        });    
    }, [])

    const ruledOut = (obj: any) => {
        for (let pattern of winningPatterns) {
            const [a, b, c] = pattern;
            if (obj[a] !== "" && obj[a] === obj[b] && obj[b] === obj[c]) {
              return true;
            }
        }
        return false;
    }

    const draw = (obj: any) => {
        for (let oneBox of allBoxes) {
            if (obj[oneBox] == "") {
              return false;
            }
        }
        return true;
    }

    onValue(boxesRef, (snapshot) => {
        const data = snapshot.val();
        if(data && JSON.stringify(data) !== JSON.stringify(boxes)) {
            setBoxes(data);
        }
        if(data && ruledOut(data) && !gameFinished) {
            if(data["winner"] == ""){
                if (uType != "watcher" && data["chance"] != uType) {
                    set(ref(db, 'games/' + search?.get("id") + '/boxes'), {...data, winner: userId });
                }
            }
            else {
                setGameFinished(true);
                setDialogOpen(true);
            }
        }
        if(data && data["winner"] == "" && gameFinished) {
            setGameFinished(false);
            toast({ id: toastIds.gameReset, title: "Game", description: `was reset` });
        }
        if(data && data["winner"] == "" && draw(data) && !gameFinished) {
            set(ref(db, 'games/' + search?.get("id") + '/boxes'), {...data, winner: "draw" });
            setGameFinished(true);
            setDialogOpen(true);
        }
    });

    const buttonClick = (number: string) => {
        if(boxes[number] == "" && uType !== "watcher" && boxes.chance == uType) {
            let tempBoxes = boxes;
            if(uType == "player1") {
                tempBoxes[number] = "X";
                tempBoxes["chance"] = "player2";
            }
            else {
                tempBoxes[number] = "O";
                tempBoxes["chance"] = "player1";
            }
            set(ref(db, 'games/' + search?.get("id") + '/boxes'), tempBoxes);
        }
    }

    const reset = () => {
        set(ref(db, 'games/' + search?.get("id") + '/boxes'), defaultBoxes);
    };

    const buttonDisable = !gameStart || uType !== boxes.chance || gameFinished;

    return (
        <>
            <div className="flex justify-center mb-4">
                {host == userId && <Button onClick={reset} disabled={!gameStart}><XIcon className="w-4 h-4 mr-2" /> Reset Game</Button>}
                <Link href={"/game?id="+Math.random().toString(36).substring(2, 8)} className="bg-red-900c">
                    <Button color="secondary" variant={"outline"} className="ml-2"><RotateCwIcon className="w-4 h-4 mr-2" /> Start New Game</Button>
                </Link>
            </div>
            <div className="flex items-center justify-center mb-2">
                {player1 !== "" && <Card className={`flex rounded-full items-center pl-2 pr-4 py-2 ${boxes.winner == player1 && 'bg-green-500'}`}>
                    <Avatar><AvatarFallback>{player1 ? player1.at(0) : "U"}</AvatarFallback></Avatar>
                    <div className="ml-2"><b>{player1}</b><p>Host | Player 1</p>
                    </div>
                </Card>}
                {player2 !== "" && 
                <>
                    <span className="mx-8">vs</span>
                    <Card className={`flex rounded-full items-center pl-2 pr-4 py-2 ${boxes.winner == player2 && 'bg-green-500'}`}>
                        <Avatar><AvatarFallback>{player2 ? player2.at(0) : "U"}</AvatarFallback></Avatar>
                        <div className="ml-2"><b>{player2}</b><p>Host | Player 2</p>
                        </div>
                    </Card>
                </>}
            </div>
            {gameStart && !gameFinished && <div className="flex justify-center mb-4">{boxes.chance == uType ? <p>Your Move</p> : <p>{uType}'s Move</p>}</div>}
            <div className="grow flex flex-col items-center justify-evenly">
                <div className="game">
                    <div className="box-wrap">
                        <button disabled={buttonDisable} onClick={() => buttonClick("first")}><span className={boxes.first}>{boxes.first}</span></button>
                        <button disabled={buttonDisable} onClick={() => buttonClick("second")}><span className={boxes.second}>{boxes.second}</span></button>
                        <button disabled={buttonDisable} onClick={() => buttonClick("third")}><span className={boxes.third}>{boxes.third}</span></button>
                        <button disabled={buttonDisable} onClick={() => buttonClick("fourth")}><span className={boxes.fourth}>{boxes.fourth}</span></button>
                        <button disabled={buttonDisable} onClick={() => buttonClick("fifth")}><span className={boxes.fifth}>{boxes.fifth}</span></button>
                        <button disabled={buttonDisable} onClick={() => buttonClick("sixth")}><span className={boxes.sixth}>{boxes.sixth}</span></button>
                        <button disabled={buttonDisable} onClick={() => buttonClick("seventh")}><span className={boxes.seventh}>{boxes.seventh}</span></button>
                        <button disabled={buttonDisable} onClick={() => buttonClick("eighth")}><span className={boxes.eighth}>{boxes.eighth}</span></button>
                        <button disabled={buttonDisable} onClick={() => buttonClick("ninth")}><span className={boxes.ninth}>{boxes.ninth}</span></button>
                    </div>
                </div>
                <Dialog open={dialogOpen} onOpenChange={() => setDialogOpen(false)}>
                    <DialogContent>
                        <DialogTitle className="flex items-center">Game Complete! <img src="/party.png" className="ml-3" height={30} width={30} /></DialogTitle>
                        {boxes.winner == "draw" ? <DialogDescription>It's a Draw!</DialogDescription> : <DialogDescription> The Game has finished. <p>{boxes.winner} has won the Game!</p></DialogDescription>}
                    </DialogContent>
                </Dialog>
                <Dialog open={name == null || name == ""} onOpenChange={() => console.log(false)}>
                    <DialogContent>
                        <DialogTitle className="flex items-center">Set Details</DialogTitle>
                        <Label htmlFor="name" className="mt-3">Name</Label>
                        <Input value={name} onChange={(e) => setName(e.currentTarget.value)} name="Name" type="name" required />
                        <DialogFooter><Button variant={"teal"} onClick={() => localStorage.setItem("userId", name)}>Save</Button></DialogFooter>
                    </DialogContent>
                </Dialog>
                {gameFinished && <h2 className="flex items-center">Game {boxes.winner == "draw" ? 'Draw' : 'Complete'}! <img src="/party.png" className="ml-3" height={30} width={30} /></h2>}
            </div>
        </>
    );
}
