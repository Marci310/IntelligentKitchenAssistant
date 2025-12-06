import { useInventory } from "../hooks/useInventory.ts";
import { z } from "zod";
import { IngredientCard } from "../components/IngredientCard";
import { ingredientSchema } from "../schemas/backendSchemas";
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from "flowbite-react";
import { useState, useRef } from "react";
import apiClient from "../service/api";
import { toast } from "react-toastify";

type Ingredient = z.infer<typeof ingredientSchema>;

export function Ingredients() {
    const {inventory, isLoading, error, refetch} = useInventory();
    const [openModal, setOpenModal] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const isCancelledRef = useRef(false);

    const startRecording = async () => {
        try {
            isCancelledRef.current = false;
            const stream = await navigator.mediaDevices.getUserMedia({audio:true});
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                audioChunksRef.current.push(event.data);
            };

            mediaRecorder.onstop = async () => {
                stream.getTracks().forEach(track => track.stop());
                if (isCancelledRef.current) {
                    toast.info("Recording cancelled.");
                    return;
                }
                const audioBlob = new Blob(audioChunksRef.current, {type:'audio/mp3'});
                await sendAudioToBackend(audioBlob);
            };

            mediaRecorder.start();
            setIsRecording(true);
        } catch (error) {
            toast.error("Failed to access microphone");
            console.error("Recording error:", error);
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    const cancelRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            isCancelledRef.current = true;
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    const sendAudioToBackend = async (audioBlob: Blob) => {
        const formData = new FormData();
        formData.append('ingredients-list', audioBlob, 'recording.mp3');

        setIsSubmitting(true);
        try {
            await apiClient.post('/ingredients', formData, {
                headers:{'Content-Type':'multipart/form-data'}
            });
            toast.success("Ingredients added successfully!");
            setOpenModal(false);
            refetch();
        } catch (error) {
            toast.error("Failed to add ingredients");
            console.error("Upload error:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error loading inventory.</div>;
    }

    return (
        <div className="flex justify-center overflow-hidden max-h-2/5">
            <div className="w-full max-w-7xl px-6 max-h-4/5">
                <h2 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white">Inventory</h2>
                <div className="flex flex-col gap-6 p-6">
                    <IngredientCard id="0" name="" unit="" quantity={0} category="Other"/>
                    {inventory?.map((ingredient: Ingredient) => (
                        <IngredientCard
                            key={ingredient.id.toString()}
                            {...ingredient}
                        />
                    ))}
                </div>
                <div className="fixed bottom-6 right-6">
                    <Button pill onClick={() => setOpenModal(true)}>
                        <svg className="w-6 h-6 text-white" aria-hidden="true"
                             xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                  d="M12 18.5A2.493 2.493 0 0 1 7.51 20H7.5a2.468 2.468 0 0 1-2.4-3.154 2.98 2.98 0 0 1-.85-5.274 2.468 2.468 0 0 1 .92-3.182 2.477 2.477 0 0 1 1.876-3.344 2.5 2.5 0 0 1 3.41-1.856A2.5 2.5 0 0 1 12 5.5m0 13v-13m0 13a2.493 2.493 0 0 0 4.49 1.5h.01a2.468 2.468 0 0 0 2.403-3.154 2.98 2.98 0 0 0 .847-5.274 2.468 2.468 0 0 0-.921-3.182 2.477 2.477 0 0 0-1.875-3.344A2.5 2.5 0 0 0 14.5 3 2.5 2.5 0 0 0 12 5.5m-8 5a2.5 2.5 0 0 1 3.48-2.3m-.28 8.551a3 3 0 0 1-2.953-5.185M20 10.5a2.5 2.5 0 0 0-3.481-2.3m.28 8.551a3 3 0 0 0 2.954-5.185"/>
                        </svg>
                    </Button>
                </div>
                <Modal show={openModal} onClose={() => setOpenModal(false)}>
                    <div className="relative">
                        {(isRecording || isSubmitting) && (
                            <div
                                className="absolute inset-0 bg-gray-500/50 dark:bg-gray-900/50 z-50 flex items-center justify-center rounded-lg">
                                <svg className="w-12 h-12 text-gray-800 dark:text-white animate-pulse" fill="none"
                                     viewBox="0 0 24 24">
                                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"
                                          strokeWidth="2"
                                          d="M12 18.5A2.493 2.493 0 0 1 7.51 20H7.5a2.468 2.468 0 0 1-2.4-3.154 2.98 2.98 0 0 1-.85-5.274 2.468 2.468 0 0 1 .92-3.182 2.477 2.477 0 0 1 1.876-3.344 2.5 2.5 0 0 1 3.41-1.856A2.5 2.5 0 0 1 12 5.5m0 13v-13m0 13a2.493 2.493 0 0 0 4.49 1.5h.01a2.468 2.468 0 0 0 2.403-3.154 2.98 2.98 0 0 0 .847-5.274 2.468 2.468 0 0 0-.921-3.182 2.477 2.477 0 0 0-1.875-3.344A2.5 2.5 0 0 0 14.5 3 2.5 2.5 0 0 0 12 5.5m-8 5a2.5 2.5 0 0 1 3.48-2.3m-.28 8.551a3 3 0 0 1-2.953-5.185M20 10.5a2.5 2.5 0 0 0-3.481-2.3m.28 8.551a3 3 0 0 0 2.954-5.185"/>
                                </svg>
                            </div>
                        )}
                        <ModalHeader>Add Ingredients by Voice</ModalHeader>
                        <ModalBody>
                            <p className="text-base leading-relaxed text-gray-500 dark:text-gray-400">
                                Tell us what ingredients you have, and we'll add them to your inventory automatically.
                            </p>
                        </ModalBody>
                    </div>
                    <ModalFooter>
                        <Button onClick={isRecording ? stopRecording : startRecording} disabled={isSubmitting}>
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                <path fillRule="evenodd"
                                      d="M5 8a1 1 0 0 1 1 1v3a4.006 4.006 0 0 0 4 4h4a4.006 4.006 0 0 0 4-4V9a1 1 0 1 1 2 0v3.001A6.006 6.006 0 0 1 14.001 18H13v2h2a1 1 0 1 1 0 2H9a1 1 0 1 1 0-2h2v-2H9.999A6.006 6.006 0 0 1 4 12.001V9a1 1 0 0 1 1-1Z"
                                      clipRule="evenodd"/>
                                <path d="M7 6a4 4 0 0 1 4-4h2a4 4 0 0 1 4 4v5a4 4 0 0 1-4 4h-2a4 4 0 0 1-4-4V6Z"/>
                            </svg>
                            {isRecording ? " Stop Recording" : " Start Recording"}
                        </Button>
                        {isRecording && (
                            <Button color="red" onClick={cancelRecording} disabled={isSubmitting}>
                                Cancel
                            </Button>
                        )}
                    </ModalFooter>
                </Modal>
            </div>
        </div>
    );
}