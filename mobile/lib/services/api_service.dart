import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import 'package:flutter/foundation.dart';

class ApiService {
  // Use 10.0.2.2 for Android Emulator, localhost for Web/iOS Simulator, 
  // and your local IP (e.g., 192.168.1.5) for physical devices.
  static String get baseUrl {
    if (kIsWeb) return 'http://localhost:5000/api';
    // For Android physical device or other platforms, change this to your PC's IP address
    return 'http://10.0.2.2:5000/api'; 
  }

  static Future<Map<String, dynamic>> login(String phone, String password) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/auth/login'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'phone': phone, 'password': password}),
      );

      final data = jsonDecode(response.body);
      if (response.statusCode == 200) {
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('token', data['token']);
        await prefs.setString('userId', data['user']['id']);
        await prefs.setString('role', data['user']['role']);
        await prefs.setString('userName', data['user']['name']);
      }
      return data;
    } catch (e) {
      return {'message': 'Connection error: $e'};
    }
  }

  static Future<Map<String, dynamic>> signup(Map<String, dynamic> userData) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/auth/signup'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode(userData),
      );
      return jsonDecode(response.body);
    } catch (e) {
      return {'message': 'Connection error: $e'};
    }
  }

  static Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.clear();
  }

  static Future<List<dynamic>> getCrops() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final userId = prefs.getString('userId'); 
      if (userId == null) return [];
      
      final response = await http.get(Uri.parse('$baseUrl/crops/$userId'));
      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      }
      return [];
    } catch (e) {
      return [];
    }
  }

  static Future<Map<String, dynamic>> addCrop(Map<String, dynamic> cropData) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final userId = prefs.getString('userId');
      if (userId == null) return {'message': 'User not logged in'};

      final response = await http.post(
        Uri.parse('$baseUrl/crops/add'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({...cropData, 'userId': userId}),
      );
      return jsonDecode(response.body);
    } catch (e) {
      return {'message': 'Connection error: $e'};
    }
  }
}
