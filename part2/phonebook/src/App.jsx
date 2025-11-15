import { useState, useEffect } from 'react'
import Filter from './Filter'
import PersonForm from './PersonForm'
import Persons from './Persons'
import personsService from './services/persons'
import Notification from './Notification'

const App = () => {
    const [persons, setPersons] = useState([])
    const [newName, setNewName] = useState('')
    const [newNumber, setNewNumber] = useState('')
    const [filter, setFilter] = useState('')
    const [successMessage, setSuccessMessage] = useState(null)

    useEffect(() => {
        console.log('effect')
        personsService
            .getAll()
            .then(initialPersons => {
                setPersons(initialPersons)
            })
    }, [])

    console.log('render', persons.length, 'persons')

    const handleNameChange = (event) => {
        setNewName(event.target.value)
    }

    const handleNumberChange = (event) => {
        setNewNumber(event.target.value)
    }

    const handleFilterChange = (event) => {
        setFilter(event.target.value)
    }

    const addPerson = (event) => {
        event.preventDefault()

        const existingPerson = persons.find(person => person.name === newName)

        if (existingPerson) {
            if (window.confirm(`${newName} is already added to phonebook, replace the old number with a new one?`)) {
                const updatedPerson = { ...existingPerson, number: newNumber }
                personsService
                    .update(existingPerson.id, updatedPerson)
                    .then(returnedPerson => {
                        setPersons(persons.map(person =>
                            person.id === existingPerson.id ? returnedPerson : person))
                        setNewName('')
                        setNewNumber('')
                        setSuccessMessage(`Updated ${returnedPerson.name}`)
                        setTimeout(() => {
                            setSuccessMessage(null)
                        }, 5000)
                    })
                    .catch(error => {
                        setSuccessMessage(`Error: ${error.response.data.error}`)
                        setTimeout(() => {
                            setSuccessMessage(null)
                        }, 5000)
                    })
            }
            return
        }

        const personObject = {
            name: newName,
            number: newNumber
        }

        personsService
            .create(personObject)
            .then(returnedPerson => {
                setPersons(persons.concat(returnedPerson))
                setNewName('')
                setNewNumber('')
                setSuccessMessage(`Added ${returnedPerson.name}`)
                setTimeout(() => {
                    setSuccessMessage(null)
                }, 5000)
            })
            .catch(error => {
                setSuccessMessage(`Error: ${error.response.data.error}`)
                setTimeout(() => {
                    setSuccessMessage(null)
                }, 5000)
            })
    }

    const personsToShow = filter === ''
        ? persons
        : persons.filter(person =>
            person.name.toLowerCase().includes(filter.toLowerCase())
        )

    const deletePerson = (id, name) => {
        if (window.confirm(`Delete ${name}?`)) {
            personsService
                .remove(id)
                .then(() => {
                    setPersons(persons.filter(person => person.id !== id))
                    setSuccessMessage(`Deleted ${name}`)
                    setTimeout(() => {
                        setSuccessMessage(null)
                    }, 5000)
                })

        }
    }

    return (
        <div>
            <h2>Phonebook</h2>

            <Notification message={successMessage} type="success" />

            <Filter filter={filter} handleFilterChange={handleFilterChange} />

            <h3>Add a new</h3>

            <PersonForm
                addPerson={addPerson}
                newName={newName}
                handleNameChange={handleNameChange}
                newNumber={newNumber}
                handleNumberChange={handleNumberChange}
            />

            <h3>Numbers</h3>

            <Persons personsToShow={personsToShow} deletePerson={deletePerson} />
        </div>
    )
}

export default App