import Ionicons from "@expo/vector-icons/Ionicons";
import { useLocalSearchParams } from "expo-router";
import {useCallback, useEffect, useState} from "react";
import { ActivityIndicator, ScrollView, StyleSheet, View } from "react-native";

import { fetchEvent, type StudentEvent } from "@/api/events";
import { Button } from "@/components/Button";
import { ScreenTitle } from "@/components/ScreenTitle";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useTheme } from "@/hooks/use-theme";
import { formatEventDate } from "@/utils/formatDate";

export default function EventDetailScreen() {
    const {id} = useLocalSearchParams<{id:string}>();
    const theme = useTheme();
    const [event, setEvent] = useState<StudentEvent | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState <string | null>(null);

    const loadEvent = useCallback(async () => {
        try {
            setError(null);
            const result = await fetchEvent(Number(id));
            if (result){
                setEvent(result)
            }else {
                setError("Evenemanget hittades inte.")
            }
        } catch {
            setError("Kunde inte hämta")
        }
    })
}
