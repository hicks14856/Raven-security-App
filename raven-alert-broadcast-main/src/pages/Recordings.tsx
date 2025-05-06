
import { useEffect, useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { PlayCircle, PauseCircle, Rewind, FastForward, Download, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from "@/contexts/AuthContext";

interface Recording {
  id: string;
  audio_url: string;
  created_at: string;
  user_id: string;
  status: string;
}

const Recordings = () => {
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentRecordingId, setCurrentRecordingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchRecordings();
    }
  }, [user]);

  const fetchRecordings = async () => {
    try {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Authentication Error",
          description: "You must be logged in to view recordings.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('emergency_recordings')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setRecordings(data || []);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching recordings:', error);
      toast({
        title: "Error",
        description: "Failed to fetch recordings.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  const handlePlay = (recording: Recording) => {
    if (currentAudio) {
      currentAudio.pause();
    }

    const audio = new Audio(recording.audio_url);
    setCurrentAudio(audio);
    setCurrentRecordingId(recording.id);

    audio.play().then(() => {
      setIsPlaying(true);
    }).catch((error) => {
      console.error('Error playing audio:', error);
      toast({
        title: "Error",
        description: "Failed to play recording.",
        variant: "destructive",
      });
    });

    audio.onended = () => {
      setIsPlaying(false);
      setCurrentRecordingId(null);
    };
  };

  const handlePause = () => {
    if (currentAudio) {
      currentAudio.pause();
      setIsPlaying(false);
    }
  };

  const handleRewind = () => {
    if (currentAudio) {
      currentAudio.currentTime = Math.max(0, currentAudio.currentTime - 10);
    }
  };

  const handleFastForward = () => {
    if (currentAudio) {
      currentAudio.currentTime = Math.min(currentAudio.duration, currentAudio.currentTime + 10);
    }
  };

  const handleDownload = (recording: Recording) => {
    const link = document.createElement('a');
    link.href = recording.audio_url;
    link.download = `recording-${new Date(recording.created_at).toISOString()}.webm`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Card className="p-6">
      <h1 className="text-2xl font-bold mb-6">My Emergency Recordings</h1>
      
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-muted-foreground">Loading recordings...</span>
        </div>
      ) : (
        <div className="space-y-4">
          {recordings.length > 0 ? (
            recordings.map((recording) => (
              <Card key={recording.id} className="p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="hover:bg-primary/10"
                      onClick={() => currentRecordingId === recording.id && isPlaying ? handlePause() : handlePlay(recording)}
                    >
                      {currentRecordingId === recording.id && isPlaying ? (
                        <PauseCircle className="h-6 w-6 text-primary" />
                      ) : (
                        <PlayCircle className="h-6 w-6 text-primary" />
                      )}
                    </Button>
                    {currentRecordingId === recording.id && (
                      <>
                        <Button variant="ghost" size="icon" className="hover:bg-primary/10" onClick={handleRewind}>
                          <Rewind className="h-5 w-5 text-primary" />
                        </Button>
                        <Button variant="ghost" size="icon" className="hover:bg-primary/10" onClick={handleFastForward}>
                          <FastForward className="h-5 w-5 text-primary" />
                        </Button>
                      </>
                    )}
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(recording.created_at), { addSuffix: true })}
                    </span>
                    <Button variant="ghost" size="icon" className="hover:bg-primary/10" onClick={() => handleDownload(recording)}>
                      <Download className="h-5 w-5 text-primary" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-2">No recordings found</p>
              <p className="text-sm text-muted-foreground">
                Recordings will appear here when you use the emergency alert feature
              </p>
            </div>
          )}
        </div>
      )}
    </Card>
  );
};

export default Recordings;
