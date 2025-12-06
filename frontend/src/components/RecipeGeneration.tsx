import { Button, Modal, ModalBody, ModalFooter, ModalHeader, Textarea, Label } from "flowbite-react";
import { useState, useRef } from "react";
import apiClient from "../service/api";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

interface RecipeGenerationProps {
    openModal: boolean;
    setOpenModal: (open: boolean) => void;
}

export function RecipeGeneration({openModal, setOpenModal}: RecipeGenerationProps) {

    const [asr, setAsr] = useState(true);
    const [isRecording, setIsRecording] = useState(false);
    const [instructions, setInstructions] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const isCancelledRef = useRef(false);
    const navigate = useNavigate();

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
        formData.append('recipe_generation', audioBlob, 'recording.mp3');

        setIsSubmitting(true);
        try {
            const response = await apiClient.post('/recipes', formData, {
                headers:{'Content-Type':'multipart/form-data'}
            });
            toast.success("Recipe generated successfully!");
            setOpenModal(false);
            return navigate(`/recipes/${response.data.id}`);
        } catch (error) {
            toast.error("Failed to generate recipe");
            console.error("Upload error:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleTextSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!instructions.trim()) {
            toast.error("Please enter your recipe instructions");
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await apiClient.post('/recipes', {instructions});
            toast.success("Recipe generated successfully!");
            setOpenModal(false);
            return navigate(`/recipes/${response.data.id}`);
        } catch (error) {
            toast.error("Failed to generate recipe");
            console.error("Submit error:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal show={openModal} onClose={() => setOpenModal(false)}>
            <div className="relative">
                {(isRecording || isSubmitting) && (
                    <div
                        className="absolute inset-0 bg-gray-500/50 dark:bg-gray-900/50 z-50 flex items-center justify-center rounded-lg">
                        <svg
                            className="w-12 h-12 text-gray-800 dark:text-white animate-pulse"
                            aria-hidden="true"
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            fill="none"
                            viewBox="0 0 24 24"
                        >
                            <path
                                stroke="currentColor"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M12 18.5A2.493 2.493 0 0 1 7.51 20H7.5a2.468 2.468 0 0 1-2.4-3.154 2.98 2.98 0 0 1-.85-5.274 2.468 2.468 0 0 1 .92-3.182 2.477 2.477 0 0 1 1.876-3.344 2.5 2.5 0 0 1 3.41-1.856A2.5 2.5 0 0 1 12 5.5m0 13v-13m0 13a2.493 2.493 0 0 0 4.49 1.5h.01a2.468 2.468 0 0 0 2.403-3.154 2.98 2.98 0 0 0 .847-5.274 2.468 2.468 0 0 0-.921-3.182 2.477 2.477 0 0 0-1.875-3.344A2.5 2.5 0 0 0 14.5 3 2.5 2.5 0 0 0 12 5.5m-8 5a2.5 2.5 0 0 1 3.48-2.3m-.28 8.551a3 3 0 0 1-2.953-5.185M20 10.5a2.5 2.5 0 0 0-3.481-2.3m.28 8.551a3 3 0 0 0 2.954-5.185"
                            />
                        </svg>
                    </div>
                )}
                <ModalHeader>Generate Using Your Voice</ModalHeader>
                {asr ? (
                    <ModalBody>
                        <div className="space-y-6">
                            <p className="text-base leading-relaxed text-gray-500 dark:text-gray-400">
                                Just tell the app what kind of food you would like, and it will generate a recipe for
                                you using AI technology.
                            </p>
                            <p className="text-base leading-relaxed text-gray-500 dark:text-gray-400">
                                If you accept, the app will start listening to your voice input. Alternatively, you can
                                type
                                your request.
                            </p>
                        </div>
                    </ModalBody>
                ) : (
                    <ModalBody>
                        <form onSubmit={handleTextSubmit} className="space-y-4">
                            <div>
                                <Label htmlFor="instructions">What would you like to cook?</Label>
                                <Textarea
                                    id="instructions"
                                    placeholder="Describe the dish you want to make..."
                                    rows={4}
                                    value={instructions}
                                    onChange={(e) => setInstructions(e.target.value)}
                                    required
                                />
                            </div>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? "Generating..." : "Generate Recipe"}
                            </Button>
                        </form>
                    </ModalBody>
                )}
            </div>
            <ModalFooter>
                {asr ? (
                    <>
                        <Button onClick={isRecording ? stopRecording : startRecording} disabled={isSubmitting}>
                            <svg className="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true"
                                 xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor"
                                 viewBox="0 0 24 24">
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
                        <Button color="alternative" onClick={() => setAsr(false)}
                                disabled={isRecording || isSubmitting}>
                            I want to type
                        </Button>
                    </>
                ) : (
                    <Button color="alternative" disabled={isSubmitting} onClick={() => setAsr(true)}>
                        Use voice instead
                    </Button>
                )}
            </ModalFooter>
        </Modal>
    );
}