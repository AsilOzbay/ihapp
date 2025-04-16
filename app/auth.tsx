import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useRouter } from "expo-router";
import { API_BASE_URL } from "./env-config";
import { useAuth } from "../context/AuthContext";

export default function AuthScreen() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [step, setStep] = useState("register");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const resetFields = () => {
    setFirstName("");
    setLastName("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setVerificationCode("");
  };

  const handleRegister = async () => {
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      await axios.post(`http://${API_BASE_URL}/register`, {
        firstName,
        lastName,
        email,
        password,
      });
      Alert.alert("Success", "Check your email for the verification code.");
      setStep("verify");
    } catch (err: any) {
      Alert.alert("Error", err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyEmail = async () => {
    if (!email || !verificationCode) {
      Alert.alert("Error", "Please enter your email and verification code.");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(`http://${API_BASE_URL}/verify`, { email, verificationCode });
      Alert.alert("Success", res.data.message);
      setIsLogin(true);
      setStep("register");
      resetFields();
    } catch (err: any) {
      Alert.alert("Error", err.response?.data?.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Email and password are required.");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(`http://${API_BASE_URL}/login`, { email, password });
      await AsyncStorage.setItem("token", res.data.token);
      await AsyncStorage.setItem("user", JSON.stringify(res.data.user));
      await login(res.data.user, res.data.token);
      Alert.alert("Success", `Welcome, ${res.data.user.firstName} ${res.data.user.lastName}`);
      resetFields();
      router.replace("/home");
    } catch (err: any) {
      Alert.alert("Error", err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.container}>
      <View style={styles.authBox}>
        <View style={styles.tabs}>
          <TouchableOpacity onPress={() => setIsLogin(true)} style={isLogin ? styles.activeTab : styles.inactiveTab}>
            <Text style={styles.tabText}>Log In</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => { setIsLogin(false); setStep("register"); }} style={!isLogin ? styles.activeTab : styles.inactiveTab}>
            <Text style={styles.tabText}>Sign Up</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#007bff" />
        ) : isLogin ? (
          <>
            <TextInput placeholder="Email" value={email} onChangeText={setEmail} style={styles.input} keyboardType="email-address" />
            <TextInput placeholder="Password" value={password} onChangeText={setPassword} style={styles.input} secureTextEntry />
            <TouchableOpacity onPress={handleLogin} style={styles.button}>
              <Text style={styles.buttonText}>Log In</Text>
            </TouchableOpacity>
          </>
        ) : step === "register" ? (
          <>
            <TextInput placeholder="First Name" value={firstName} onChangeText={setFirstName} style={styles.input} />
            <TextInput placeholder="Last Name" value={lastName} onChangeText={setLastName} style={styles.input} />
            <TextInput placeholder="Email" value={email} onChangeText={setEmail} style={styles.input} keyboardType="email-address" />
            <TextInput placeholder="Password" value={password} onChangeText={setPassword} style={styles.input} secureTextEntry />
            <TextInput placeholder="Confirm Password" value={confirmPassword} onChangeText={setConfirmPassword} style={styles.input} secureTextEntry />
            <TouchableOpacity onPress={handleRegister} style={styles.button}>
              <Text style={styles.buttonText}>Sign Up</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TextInput placeholder="Verification Code" value={verificationCode} onChangeText={setVerificationCode} style={styles.input} keyboardType="numeric" />
            <TouchableOpacity onPress={handleVerifyEmail} style={styles.button}>
              <Text style={styles.buttonText}>Verify Email</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#f9f9f9" },
  authBox: { width: "85%", backgroundColor: "white", padding: 20, borderRadius: 10, elevation: 5 },
  tabs: { flexDirection: "row", justifyContent: "space-between", borderBottomWidth: 1, borderBottomColor: "#ddd", marginBottom: 10 },
  activeTab: { flex: 1, borderBottomWidth: 2, borderBottomColor: "#007bff", paddingVertical: 8 },
  inactiveTab: { flex: 1, paddingVertical: 8 },
  tabText: { textAlign: "center", fontSize: 16, fontWeight: "bold", color: "#333" },
  input: { borderWidth: 1, borderColor: "#ccc", padding: 10, borderRadius: 6, marginBottom: 10 },
  button: { backgroundColor: "#007bff", padding: 12, borderRadius: 6, alignItems: "center" },
  buttonText: { color: "white", fontSize: 16, fontWeight: "bold" },
});
