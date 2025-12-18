-- Ausgewählte Dateien im Finder mit Erstellungsdatum präfixen
tell application "Finder"
    set theSelection to selection
    if theSelection is {} then
        display alert "Keine Dateien ausgewählt." as warning
        return
    end if
    
    repeat with thisFile in theSelection
        set theName to name of thisFile
        set theCreationDate to creation date of thisFile
        
        -- Datum in YYYY-MM-DD formatieren
        set theYear to year of theCreationDate as text
        set m to month of theCreationDate as integer
        if m < 10 then
            set theMonth to "0" & m
        else
            set theMonth to m as text
        end if
        set d to day of theCreationDate
        if d < 10 then
            set theDay to "0" & d
        else
            set theDay to d as text
        end if
        
        set datePrefix to theYear & "-" & theMonth & "-" & theDay & " – "
        
        -- Nur hinzufügen, wenn es noch nicht vorne steht
        if theName does not start with datePrefix then
            set name of thisFile to datePrefix & theName
        end if
    end repeat
end tell
