// IndexedDB Configuration
const dbConfig = {
    name: 'AppointmentDB',
    version: 1,
    storeName: 'appointments'
};

// Database Helper Class
class AppointmentDB {
    constructor() {
        this.db = null;
        this.initDB();
    }

    // Initialize Database
    initDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(dbConfig.name, dbConfig.version);

            request.onerror = (event) => {
                console.error('Database error:', event.target.error);
                reject(event.target.error);
            };

            request.onsuccess = (event) => {
                this.db = event.target.result;
                console.log('Database opened successfully');
                resolve(this.db);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains(dbConfig.storeName)) {
                    const store = db.createObjectStore(dbConfig.storeName, {
                        keyPath: 'id',
                        autoIncrement: true
                    });
                    
                    // Create indexes for searching
                    store.createIndex('email', 'email', { unique: false });
                    store.createIndex('appointmentDate', 'appointmentDate', { unique: false });
                }
            };
        });
    }

    // Add new appointment
    async addAppointment(appointmentData) {
        try {
            const transaction = this.db.transaction([dbConfig.storeName], 'readwrite');
            const store = transaction.objectStore(dbConfig.storeName);
            
            // Check for duplicate appointment
            const isDuplicate = await this.checkDuplicate(
                appointmentData.appointmentDate,
                appointmentData.appointmentTime
            );
            
            if (isDuplicate) {
                throw new Error('Un rendez-vous existe déjà à cette date et heure.');
            }

            const request = store.add(appointmentData);
            
            return new Promise((resolve, reject) => {
                request.onsuccess = () => resolve(request.result);
                request.onerror = () => reject(request.error);
                transaction.oncomplete = () => {
                    console.log('Appointment added successfully');
                    this.loadAppointments(); // Refresh the list
                };
            });
        } catch (error) {
            console.error('Error adding appointment:', error);
            throw error;
        }
    }

    // Update existing appointment
    async updateAppointment(id, appointmentData) {
        try {
            const transaction = this.db.transaction([dbConfig.storeName], 'readwrite');
            const store = transaction.objectStore(dbConfig.storeName);
            
            appointmentData.id = id; // Ensure ID is included
            const request = store.put(appointmentData);
            
            return new Promise((resolve, reject) => {
                request.onsuccess = () => resolve(request.result);
                request.onerror = () => reject(request.error);
                transaction.oncomplete = () => {
                    console.log('Appointment updated successfully');
                    this.loadAppointments(); // Refresh the list
                };
            });
        } catch (error) {
            console.error('Error updating appointment:', error);
            throw error;
        }
    }

    // Delete appointment
    async deleteAppointment(id) {
        try {
            const transaction = this.db.transaction([dbConfig.storeName], 'readwrite');
            const store = transaction.objectStore(dbConfig.storeName);
            const request = store.delete(id);
            
            return new Promise((resolve, reject) => {
                request.onsuccess = () => resolve(request.result);
                request.onerror = () => reject(request.error);
                transaction.oncomplete = () => {
                    console.log('Appointment deleted successfully');
                    this.loadAppointments(); // Refresh the list
                };
            });
        } catch (error) {
            console.error('Error deleting appointment:', error);
            throw error;
        }
    }

    // Check for duplicate appointments
    async checkDuplicate(date, time) {
        try {
            const transaction = this.db.transaction([dbConfig.storeName], 'readonly');
            const store = transaction.objectStore(dbConfig.storeName);
            const index = store.index('appointmentDate');
            const request = index.getAll(IDBKeyRange.only(date));
            
            return new Promise((resolve, reject) => {
                request.onsuccess = () => {
                    const appointments = request.result;
                    const isDuplicate = appointments.some(apt => apt.appointmentTime === time);
                    resolve(isDuplicate);
                };
                request.onerror = () => reject(request.error);
            });
        } catch (error) {
            console.error('Error checking duplicates:', error);
            throw error;
        }
    }

    // Load all appointments
    async loadAppointments() {
        try {
            const transaction = this.db.transaction([dbConfig.storeName], 'readonly');
            const store = transaction.objectStore(dbConfig.storeName);
            const request = store.getAll();
            
            request.onsuccess = () => {
                const appointments = request.result;
                this.displayAppointments(appointments);
            };
        } catch (error) {
            console.error('Error loading appointments:', error);
            throw error;
        }
    }

    // Display appointments in the UI
    displayAppointments(appointments) {
        const container = document.getElementById('appointments');
        container.innerHTML = '<h3>Vos Rendez-vous</h3>';
        
        appointments.forEach(apt => {
            const appointmentDiv = document.createElement('div');
            appointmentDiv.className = 'appointment-item';
            appointmentDiv.innerHTML = `
                <p><strong>Nom:</strong> ${apt.name}</p>
                <p><strong>Date:</strong> ${apt.appointmentDate}</p>
                <p><strong>Heure:</strong> ${apt.appointmentTime}</p>
                <p><strong>Médecin:</strong> ${apt.doctor}</p>
                <p><strong>Spécialité:</strong> ${apt.specialty}</p>
                <div class="appointment-actions">
                    <button onclick="appointmentDB.editAppointment(${apt.id})" class="edit-btn">Modifier</button>
                    <button onclick="appointmentDB.deleteAppointment(${apt.id})" class="delete-btn">Supprimer</button>
                </div>
            `;
            container.appendChild(appointmentDiv);
        });
    }

    // Get appointment by ID
    async getAppointment(id) {
        try {
            const transaction = this.db.transaction([dbConfig.storeName], 'readonly');
            const store = transaction.objectStore(dbConfig.storeName);
            const request = store.get(id);
            
            return new Promise((resolve, reject) => {
                request.onsuccess = () => resolve(request.result);
                request.onerror = () => reject(request.error);
            });
        } catch (error) {
            console.error('Error getting appointment:', error);
            throw error;
        }
    }
}

// Initialize database
const appointmentDB = new AppointmentDB();

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('appointment-form');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = {
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                doctor: document.getElementById('doctor').value,
                specialty: document.getElementById('specialty').value,
                appointmentDate: document.getElementById('appointment-date').value,
                appointmentTime: document.getElementById('appointment-time').value,
                // Add other form fields as needed
            };

            try {
                await appointmentDB.addAppointment(formData);
                form.reset();
                alert('Rendez-vous ajouté avec succès!');
            } catch (error) {
                alert(`Erreur: ${error.message}`);
            }
        });
    }
});